import {HttpError} from "../../utils/httpError";
import {getDynamicConnection} from "../connectorManager";
import {FastifyRequest} from "fastify";
import {
  DatabaseInspectionRepository,
  DataSourceRepository,
  QueriesRepository,
} from "../../repository/db";
import {
  TExecuteGetEntityProps,
  TExecuteInsert,
  TExecuteQuery,
  TExecuteQueryResult,
  TExecuteUpdate,
  TQueryMutationValue,
  TExecuteGetEntityResponse,
  TRunSqlResult
} from "@dataramen/types";
import { DatabaseDialect, isAggregationFunction } from "@dataramen/sql-builder";
import {mapDataSourceToDbConnection} from "../../utils/dataSourceUtils";
import {In} from "typeorm";
import {computeColumns, extractTables, getAllowedOrderBy, parseClientFilters, processInputColumn} from "./utils";
import {createUpdateBuilder, createSelectBuilder} from "./builders";
import {escapeColumnName} from "./utils/escape";

async function saveHistoryEntry (userId: string, teamId: string, props: TExecuteQuery) {
  return QueriesRepository.save(
    QueriesRepository.create({
      user: {
        id: userId,
      },
      team: {
        id: teamId,
      },
      dataSource: {
        id: props.datasourceId,
      },
      name: props.name,
      opts: props.opts,
    }),
  );
}

export const runSelect = async (
  req: FastifyRequest,
  props: TExecuteQuery
): Promise<TRunSqlResult> => {
  const { datasourceId, size = 20, page } = props;
  const { table, joins, groupBy, orderBy } = props.opts;
  const dataSource = await getDataSource(datasourceId);
  const allColumns: TRunSqlResult["allColumns"] = [];
  const columns = computeColumns(
    props.opts.columns,
    props.opts.groupBy,
    props.opts.aggregations,
  );

  if (!dataSource) {
    throw new HttpError(404, "Datasource not found");
  }

  const tables = extractTables(props.opts);
  const historyPromise = saveHistoryEntry(
    req.user.id,
    req.user.currentTeamId,
    props,
  );

  const info = await DatabaseInspectionRepository.find({
    where: {
      tableName: In(tables),
      datasource: {
        id: props.datasourceId,
      },
    },
  });

  const builder = createSelectBuilder(table, dataSource);
  builder.setLimit(size + 1);
  builder.setOffset(size * page);

  if (joins) {
    joins.forEach(builder.addJoin);
  }

  const allowedOrderBy = getAllowedOrderBy(columns, orderBy, dataSource.dbType as DatabaseDialect);
  if (allowedOrderBy.length > 0) {
    allowedOrderBy.forEach(
      ({ column, direction }) => builder.addOrderBy(column, direction)
    );
  }

  if (groupBy && groupBy.length > 0) {
    groupBy.forEach(builder.addGroupBy);
  }

  for (const table of info) {
    if (!table.columns) continue;

    for (const column of table.columns) {
      allColumns.push({
        column: column.name,
        table: table.tableName || '',
        full: `${table.tableName}.${column.name}`,
        type: column.type,
      });
    }
  }

  const columnTypes = allColumns.reduce((acc, cur) => {
    acc[cur.full] = cur.type;
    return acc;
  }, {} as Record<string, string>);

  const filters = parseClientFilters(props.opts.filters, columnTypes);
  filters?.forEach((w) => {
    if (w.fn && isAggregationFunction(w.fn)) {
      builder.addHaving(w);
    } else {
      builder.addWhere(w);
    }
  });

  let selectedColumns: string[];
  if (columns && columns.length > 0) {
    selectedColumns = columns.map((c) => processInputColumn(c, dataSource.dbType as DatabaseDialect));
  } else {
    selectedColumns = allColumns.map((c) => escapeColumnName(c.full, dataSource.dbType as DatabaseDialect));
  }

  builder.setColumns(selectedColumns);

  const { sql, params } = builder.build();
  const dbConnectionManager = await getDynamicConnection(
    mapDataSourceToDbConnection(dataSource, true),
    dataSource.dbType,
    req,
  );

  const result = await dbConnectionManager.executeQuery({
    sql,
    params,
    type: "SELECT",
    allowBulkUpdate: false,
  });

  const hasMore = result.rows.length > size;
  if (hasMore) {
    // remove extra row
    result.rows.pop();
  }

  const { id: queryHistoryId } = await historyPromise;

  return {
    ...result,
    queryHistoryId,
    tables,
    allColumns,
    columns: result.columns.map((c) => ({
      ...c,
      type: columnTypes[c.full],
    })),
    hasMore,
  };
};

export const getEntity = async (req: FastifyRequest, props: TExecuteGetEntityProps): Promise<TExecuteGetEntityResponse> => {
  const dataSource = await getDataSource(props.dataSourceId);

  if (!dataSource) {
    throw new HttpError(400, "Invalid datasource");
  }

  const dbConnectionManager = await getDynamicConnection(mapDataSourceToDbConnection(dataSource, true), dataSource.dbType, req);
  const queryBuilder = createSelectBuilder(props.table, dataSource);
  queryBuilder.setLimit(2);
  for (const [key, value] of Object.entries(props.props)) {
    queryBuilder.addWhere({
      value: [{ value }],
      column: key,
      connector: "AND",
      isEnabled: true,
      operator: "=",
      id: "dummy", // todo: id here makes no sense
    });
  }

  const { sql, params } = queryBuilder.build();
  const result = await dbConnectionManager.executeQuery({
    sql,
    params,
    type: "SELECT",
    allowBulkUpdate: false,
  });

  if (result.rows.length > 1) {
    throw new HttpError(400, "Found multiple rows for given query");
  } else if (result.rows.length < 1) {
    throw new HttpError(404, "Entity not found");
  }

  return {
    entity: result.rows[0],
    columns: result.columns,
    sql,
  }
};

export const runUpdate = async (req: FastifyRequest, props: TExecuteUpdate): Promise<TExecuteQueryResult> => {
  const dataSource = await getDataSource(props.datasourceId);

  if (!dataSource) {
    throw new HttpError(404, "Data source not found");
  }

  if (!dataSource.allowUpdate) {
    throw new HttpError(403, "This datasource does not allow update operations");
  }

  const queryBuilder = createUpdateBuilder(props.table, dataSource);

  const inputParams: Record<string, any> = {};
  for (const { column, value } of props.values) {
    const strValue = `${value}`;
    if (strValue.startsWith("=")) {
      inputParams[column] = strValue.substring(1);
    } else {
      inputParams[column] = strValue;
    }
  }

  queryBuilder.setParams(inputParams);
  props.filters.forEach((filter) => {
    queryBuilder.addWhere(filter);
  });

  const { sql, params } = queryBuilder.build();
  const dbConnectionManager = await getDynamicConnection(mapDataSourceToDbConnection(dataSource, true), dataSource.dbType, req);
  return dbConnectionManager.executeQuery({
    sql,
    params,
    type: "UPDATE",
    allowBulkUpdate: false,
  });
};

export const runInsert = async (req: FastifyRequest, props: TExecuteInsert): Promise<TExecuteQueryResult> => {
  const dataSource = await getDataSource(props.datasourceId);

  if (!dataSource) {
    throw new HttpError(404, "Data source not found");
  }

  if (!dataSource.allowInsert) {
    throw new HttpError(403, "This datasource does not allow insert operations");
  }

  // todo: create builder
  const { keys, values } = queryMutationValuesToString(props.values);
  const query = `INSERT INTO ${props.table} (${keys}) VALUES (${values})`;

  const dbConnectionManager = await getDynamicConnection(mapDataSourceToDbConnection(dataSource, true), dataSource.dbType, req);
  return dbConnectionManager.executeQuery({
    sql: query,
    type: "INSERT",
    allowBulkUpdate: false,
  });
};

// todo: move to query builder everything below this comment
const queryMutationValuesToString = (mutValues: TQueryMutationValue[]): { keys: string; values: string; } => {
  const keys = mutValues.map(({ column }) => column).join(", ");
  const values = mutValues.map(({ value }) => {
    if (typeof value === "string") {
      // ex: =NULL or =NOW()
      if (value && value.startsWith("=")) {
        return value.substring(1);
      } else {
        return `'${value}'`;
      }
    } else {
      return value;
    }
  }).join(", ");

  return {
    keys,
    values,
  };
};

async function getDataSource (dsId: string) {
  return DataSourceRepository.findOne({
    where: {
      id: dsId,
    },
    select: ["id", "dbType", "dbDatabase", "dbPassword", "dbPasswordTag", "dbPasswordIv", "dbPort", "dbUrl", "dbSchema", "dbUser", "allowUpdate", "allowInsert"],
  });
}
