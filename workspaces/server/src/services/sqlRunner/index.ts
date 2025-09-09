import {HttpError} from "../../utils/httpError";
import {getDynamicConnection} from "../connectorManager";
import {FastifyRequest} from "fastify";
import {DatabaseInspectionRepository, DataSourceRepository} from "../../repository/db";
import {
  TExecuteInsert,
  TExecuteQuery,
  TExecuteQueryResult,
  TExecuteUpdate, TInputColumn,
  TQueryMutationValue,
  TRunSqlResult
} from "@dataramen/types";
import {
  buildQueryFilterCondition,
  DatabaseDialect,
  SelectQueryBuilder,
  isAllowedFunction,
  isAggregationFunction,
  PostgreSqlFunctions,
  MySqlColumnFunctions, OrderByClause
} from "@dataramen/sql-builder";
import {In} from "typeorm";
import {inputColumnToAlias, STRING_TYPES} from "@dataramen/common";
import {mapDataSourceToDbConnection} from "../../utils/dataSourceUtils";

export const runSelect = async (
  req: FastifyRequest,
  props: TExecuteQuery
): Promise<TRunSqlResult> => {
  const { table, datasourceId, filters, joins, orderBy, size, page, columns, groupBy, searchAll } = props;
  const dataSource = await DataSourceRepository.findOne({
    where: {
      id: datasourceId,
    },
    select: ["id", "dbType", "dbDatabase", "dbPassword", "dbPasswordTag", "dbPasswordIv", "dbPort", "dbUrl", "dbSchema", "dbUser"],
  });
  const tables: string[] = [table];
  const allColumns: TRunSqlResult["allColumns"] = [];

  if (!dataSource) {
    throw new HttpError(404, "Data source not found");
  }

  const queryBuilder = new SelectQueryBuilder(dataSource.dbType as DatabaseDialect);
  queryBuilder.setTable(table);
  queryBuilder.setLimit(size || 20);
  queryBuilder.setOffset(size * page);

  filters?.forEach((w) => {
    if (w.fn && isAggregationFunction(w.fn)) {
      queryBuilder.addHaving(w);
    } else {
      queryBuilder.addWhere(w);
    }
  });

  if (joins) {
    queryBuilder.addJoin(...joins);
    joins.forEach((join) => {
      tables.push(join.table);
    });
  }

  const allowedOrderBy = getAllowedOrderBy(props, dataSource.dbType as DatabaseDialect);
  if (allowedOrderBy.length > 0) {
    queryBuilder.addOrderBy(...allowedOrderBy);
  }

  if (groupBy && groupBy.length > 0) {
    groupBy.forEach((g) => queryBuilder.addGroupBy(
      processInputGroupBy(g, dataSource.dbType)),
    );
  }

  const info = await DatabaseInspectionRepository.find({
    where: {
      tableName: In(tables),
      datasource: {
        id: datasourceId,
      },
    },
  });

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

  let selectedColumns: string[];
  if (columns && columns.length > 0) {
    selectedColumns = columns.map((c) => processInputColumn(c, dataSource.dbType));
  } else {
    selectedColumns = allColumns.map((c) => `${c.full} as "${c.full}"`);
  }

  queryBuilder.selectColumns(selectedColumns);

  if (searchAll) {
    const stringFields = allColumns.filter((col) => {
      return STRING_TYPES.includes(col.type) && selectedColumns.some((sel) => sel.startsWith(col.full));
    });
    if (stringFields.length > 0) {
      const rawFilter = stringFields.map((prop) => `LOWER(${prop.full}) LIKE '%${searchAll.toLowerCase()}%'`);
      queryBuilder.addWhereRaw(`(${rawFilter.join(" OR ")})`, 'AND');
    }
  }

  const dbConnectionManager = await getDynamicConnection(mapDataSourceToDbConnection(dataSource, true), dataSource.dbType, req);
  const result = await dbConnectionManager.executeQuery(
    queryBuilder.toSQL(),
    {
      type: "SELECT",
      allowBulkUpdate: false,
    }
  );

  return {
    ...result,
    tables,
    allColumns,
  };
};

export const runUpdate = async (req: FastifyRequest, props: TExecuteUpdate): Promise<TExecuteQueryResult> => {
  const dataSource = await DataSourceRepository.findOne({
    where: {
      id: props.datasourceId,
    },
    select: ["id", "dbType", "dbDatabase", "dbPassword", "dbPasswordTag", "dbPasswordIv", "dbPort", "dbUrl", "dbSchema", "dbUser", "allowUpdate"],
  });

  if (!dataSource) {
    throw new HttpError(404, "Data source not found");
  }

  if (!dataSource.allowUpdate) {
    throw new HttpError(403, "This datasource does not allow update operations");
  }

  const setStatements = props.values.map(({ value, column }) => {
    if (typeof value === "string") {
      // ex: =NULL or =NOW()
      if (value && value.startsWith("=")) {
        return `${column}=${value.substring(1)}`;
      } else {
        return `${column}='${value}'`;
      }
    } else {
      return `${column}='${value}'`;
    }
  }).join(", ");
  const whereStatements = props.filters.map(
    (column) => buildQueryFilterCondition(column, dataSource.dbType as DatabaseDialect)
  ).join(" AND ");
  const query = `UPDATE ${props.table} SET ${setStatements} WHERE ${whereStatements}`;

  const dbConnectionManager = await getDynamicConnection(mapDataSourceToDbConnection(dataSource, true), dataSource.dbType, req);
  return dbConnectionManager.executeQuery(
    query,
    {
      type: "UPDATE",
      allowBulkUpdate: false,
    }
  );
};

export const runInsert = async (req: FastifyRequest, props: TExecuteInsert): Promise<TExecuteQueryResult> => {
  const dataSource = await DataSourceRepository.findOne({
    where: {
      id: props.datasourceId,
    },
    select: ["id", "dbType", "dbDatabase", "dbPassword", "dbPasswordTag", "dbPasswordIv", "dbPort", "dbUrl", "dbSchema", "dbUser", "allowInsert"],
  });

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
  return dbConnectionManager.executeQuery(
    query,
    {
      type: "INSERT",
      allowBulkUpdate: false,
    }
  );
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

const processInputColumn = (column: TInputColumn, dbType: string): string => {
  if (column.fn) {
    if (isAllowedFunction(column.fn)) {
      const colString = (dbType === "postgres" ? PostgreSqlFunctions : MySqlColumnFunctions)[column.fn](column);
      return `${colString} as "${inputColumnToAlias(column)}"`;
    }

    throw new Error("Function not allowed: " + column.fn);
  }

  return `${column.value} as "${column.value}"`;
};

const processInputGroupBy = (column: TInputColumn, dbType: string): string => {
  if (column.fn) {
    if (isAllowedFunction(column.fn)) {
      return (dbType === "postgres" ? PostgreSqlFunctions : MySqlColumnFunctions)[column.fn]({
        ...column,
        value: sanitizeFullColumn(column.value, dbType as DatabaseDialect),
      });
    }

    throw new Error("Function not allowed: " + column.fn);
  }

  return sanitizeFullColumn(column.value, dbType as DatabaseDialect);
};

const handleAlias = (value: string, dbType: DatabaseDialect) => {
  if (dbType === "postgres") {
    return `"${value}"`;
  }

  if (dbType === "mysql") {
    return `\`${value}\``;
  }

  return value;
};

const sanitizeFullColumn = (value: string, dbType: DatabaseDialect): string => {
  const [table, column] = value.split(".");
  return handleAlias(table, dbType) + "." + handleAlias(column, dbType);
};

const getAllowedOrderBy = (props: TExecuteQuery, dbType: DatabaseDialect): OrderByClause[] => {
  if (!props.orderBy) {
    return [];
  }

  let orderBy: OrderByClause[] = props.orderBy;

  if (props.columns && props.columns.length > 0) {
    const allowedColumnsMap = props.columns.reduce((acc, val) => {
      acc.set(inputColumnToAlias(val), {
        isFn: !!(val.fn || val.distinct),
      });

      return acc;
    }, new Map<string, { isFn: boolean }>());

    // only order by columns in group by
    orderBy = props.orderBy
      .filter((o) => allowedColumnsMap.has(o.column))
      .map((o) => {
        if (allowedColumnsMap.get(o.column)?.isFn) {
          return {
            ...o,
            column: handleAlias(o.column, dbType),
          }
        }
        return o;
      });
  }

  return orderBy;
};
