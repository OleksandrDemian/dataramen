import {HttpError} from "../../utils/httpError";
import {getDynamicConnection} from "../connectorManager";
import {FastifyRequest} from "fastify";
import {DataSourceRepository, QueriesRepository,} from "../../repository/db";
import {
  TExecuteGetEntityProps,
  TExecuteGetEntityResponse,
  TExecuteInsert,
  TExecuteQuery,
  TExecuteQueryResult,
  TExecuteUpdate,
  TRunSqlResult
} from "@dataramen/types";
import {mapDataSourceToDbConnection} from "../../utils/dataSourceUtils";
import {computeColumns, computeResultColumns, extractTables, transformClientFilters} from "./utils/clientUtils";
import {createInsertBuilder, createSelectBuilder, createUpdateBuilder} from "./builders";
import {createSchemaInfoHandler} from "./utils/schemaInfoHandler";
import {ISelectColumn} from "./builders/types";
import {DatasourceDriver} from "./utils/base";
import {EQueryType} from "../connectorManager/types";
import {isAggregationFunction} from "./utils/columnFunctions";

async function saveHistoryEntry (userId: string, teamId: string, props: TExecuteQuery) {
  return QueriesRepository.save(
    QueriesRepository.create({
      user: { id: userId },
      team: { id: teamId },
      dataSource: { id: props.datasourceId },
      name: props.name,
      opts: props.opts,
    }),
  );
}

/**
 * **************
 * SELECT
 * **************
 */
export const runSelect = async (
  req: FastifyRequest,
  props: TExecuteQuery
): Promise<TRunSqlResult> => {
  const { datasourceId, size = 20, page } = props;
  const { table, joins, groupBy, orderBy } = props.opts;
  const dataSource = await getDataSource(datasourceId);

  if (!dataSource) {
    throw new HttpError(404, "Datasource not found");
  }

  const columns = computeColumns(
    props.opts.columns,
    props.opts.groupBy,
    props.opts.aggregations,
  );
  const tables = extractTables(props.opts);

  const schemaInfoHandler = await createSchemaInfoHandler(datasourceId, tables);
  const allColumns = schemaInfoHandler.getAllColumns();

  let selectedColumns: ISelectColumn[];
  if (columns && columns.length > 0) {
    selectedColumns = columns;
  } else {
    // do not validate columns already stored in DB
    selectedColumns = allColumns.map((c) => ({
      column: c.full,
    }));
  }

  selectedColumns.forEach((col) => {
    if (!schemaInfoHandler.hasColumn(col.column)) {
      throw new HttpError(400, `Invalid column ${col.column}`);
    }
  });

  const historyPromise = saveHistoryEntry(
    req.user.id,
    req.user.currentTeamId,
    props,
  );

  const builder = createSelectBuilder(table, dataSource);
  builder.setLimit(size + 1);
  builder.setOffset(size * page);
  builder.setColumns(selectedColumns);

  /**
   * **************
   * JOIN
   * **************
   */
  if (joins) {
    joins.forEach(builder.addJoin);
  }

  /**
   * **************
   * ORDER BY
   * **************
   */
  if (orderBy.length > 0) {
    orderBy.forEach(({column, direction}) => {
      if (builder.hasAlias(column)) {
        builder.addOrderBy(
          DatasourceDriver[dataSource.dbType].escape(column),
          direction,
        );
      }
    });
  }

  /**
   * **************
   * GROUP BY
   * **************
   */
  if (groupBy && groupBy.length > 0) {
    groupBy.forEach((g) => {
      if (schemaInfoHandler.hasColumn(g.value)) {
        builder.addGroupBy({
          column: g.value,
          fn: g.fn,
          distinct: g.distinct,
        });
      }
    });
  }

  /**
   * **************
   * WHERE
   * **************
   */
  const filters = transformClientFilters(props.opts.filters, schemaInfoHandler.getColumnType);
  filters.forEach((filter) => {
    if (filter.fn && isAggregationFunction(filter.fn)) {
      builder.addHaving(filter);
    } else {
      builder.addWhere(filter);
    }
  });

  const { sql, params } = builder.build();
  const dbConnectionManager = await getDynamicConnection(
    mapDataSourceToDbConnection(dataSource, true),
    dataSource.dbType,
    req,
  );

  /**
   * **************
   * EXECUTE
   * **************
   */
  const result = await dbConnectionManager.executeQuery({
    sql,
    params,
    type: EQueryType.SELECT,
    allowBulkUpdate: false,
  });

  /**
   * **************
   * POST EXECUTE
   * **************
   */
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
    columns: computeResultColumns(
      selectedColumns,
      result.columns,
      schemaInfoHandler.getColumnType,
    ),
    hasMore,
  };
};

/**
 * **************
 * SELECT ONE
 * **************
 */
export const runSelectOne = async (req: FastifyRequest, props: TExecuteGetEntityProps): Promise<TExecuteGetEntityResponse> => {
  const dataSource = await getDataSource(props.dataSourceId);

  if (!dataSource) {
    throw new HttpError(400, "Invalid datasource");
  }

  const dbConnectionManager = await getDynamicConnection(
    mapDataSourceToDbConnection(dataSource, true),
    dataSource.dbType,
    req,
  );
  const queryBuilder = createSelectBuilder(props.table, dataSource);
  queryBuilder.setLimit(2);
  for (const [key, value] of Object.entries(props.props)) {
    queryBuilder.addWhere({
      value: [{ value }],
      column: key,
    });
  }

  const { sql, params } = queryBuilder.build();
  const result = await dbConnectionManager.executeQuery({
    sql,
    params,
    type: EQueryType.SELECT,
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

/**
 * **************
 * UPDATE
 * **************
 */
export const runUpdate = async (req: FastifyRequest, props: TExecuteUpdate): Promise<TExecuteQueryResult> => {
  const dataSource = await getDataSource(props.datasourceId);

  if (!dataSource) {
    throw new HttpError(404, "Data source not found");
  }

  if (!dataSource.allowUpdate) {
    throw new HttpError(403, "This datasource does not allow update operations");
  }

  const queryBuilder = createUpdateBuilder(props.table, dataSource);
  queryBuilder.setParams(props.values);

  transformClientFilters(
    props.filters,
    // fake getColumnType, always return equals operator "="
    () => "="
  ).forEach((filter) => {
    queryBuilder.addWhere(filter);
  });

  const { sql, params } = queryBuilder.build();
  const dbConnectionManager = await getDynamicConnection(mapDataSourceToDbConnection(dataSource, true), dataSource.dbType, req);
  return dbConnectionManager.executeQuery({
    sql,
    params,
    type: EQueryType.UPDATE,
    allowBulkUpdate: false,
  });
};

/**
 * **************
 * INSERT
 * **************
 */
export const runInsert = async (req: FastifyRequest, props: TExecuteInsert): Promise<TExecuteQueryResult> => {
  const dataSource = await getDataSource(props.datasourceId);

  if (!dataSource) {
    throw new HttpError(404, "Data source not found");
  }

  if (!dataSource.allowInsert) {
    throw new HttpError(403, "This datasource does not allow insert operations");
  }

  const queryBuilder = createInsertBuilder(props.table, dataSource);
  queryBuilder.setValues(props.values);

  const { sql, params } = queryBuilder.build();
  const dbConnectionManager = await getDynamicConnection(mapDataSourceToDbConnection(dataSource, true), dataSource.dbType, req);
  return dbConnectionManager.executeQuery({
    sql,
    type: EQueryType.INSERT,
    params,
    allowBulkUpdate: false,
  });
};

/**
 * **************
 * UTILS
 * **************
 */
async function getDataSource (dsId: string) {
  return DataSourceRepository.findOne({
    where: {
      id: dsId,
    },
    select: ["id", "dbType", "dbDatabase", "dbPassword", "dbPasswordTag", "dbPasswordIv", "dbPort", "dbUrl", "dbSchema", "dbUser", "allowUpdate", "allowInsert"],
  });
}
