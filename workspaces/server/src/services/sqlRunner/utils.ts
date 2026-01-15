import {
  DatabaseDialect,
  isAllowedFunction,
  MySqlColumnFunctions,
  OrderByClause,
  PostgreSqlFunctions,
  QueryFilter,
  TQueryOperator
} from "@dataramen/sql-builder";
import {TInputColumn, TQueryFilter, TQueryOptions} from "@dataramen/types";
import {FilterParser, inputColumnToAlias, isStringType} from "@dataramen/common";
import {HttpError} from "../../utils/httpError";
import {escapeColumnName} from "./utils/escape";

const getDefaultOperator = (type: string): TQueryOperator => {
  return isStringType(type) ? 'LIKE' : '=';
}

export const parseClientFilters = (filters: TQueryFilter[], columnTypes: Record<string, string>): QueryFilter[] => {
  const parsedFilters: QueryFilter[] = [];
  for (const f of filters) {
    if (!f.column?.length || !f.value?.length || f.isEnabled === false) continue;

    if (f.isAdvanced) {
      const parsed = FilterParser.parse(f.value);
      if (!parsed) {
        throw new HttpError(400, `Invalid value for '${f.column}': ${f.value}`);
      }

      parsedFilters.push({
        value: parsed.value,
        column: f.column,
        id: f.id,
        operator: parsed.operator || getDefaultOperator(columnTypes[f.column]),
        connector: "AND",
      });
    } else {
      parsedFilters.push({
        value: f.value ? [{ value: f.value }] : [],
        column: f.column,
        id: f.id,
        operator: getDefaultOperator(columnTypes[f.column]),
        connector: "AND",
      });
    }
  }

  return parsedFilters;
};

export const extractTables = (props: TQueryOptions): string[] => {
  const tables: string[] = [props.table];
  if (props.joins) {
    props.joins.forEach(({ table }) => tables.push(table));
  }

  return tables;
};

export const computeColumns = (cols: TInputColumn[], groupBy: TInputColumn[], agg: TInputColumn[]): TInputColumn[] => {
  const result: TInputColumn[] = [];
  if (groupBy.length > 0 || agg.length > 0) {
    result.push(...groupBy, ...agg);
  } else if (cols.length > 0) {
    result.push(...cols);
  }

  return result;
};

export const handleAlias = (value: string, dbType: DatabaseDialect) => {
  if (dbType === "postgres") {
    return `"${value}"`;
  }

  if (dbType === "mysql") {
    return `\`${value}\``;
  }

  return value;
};

export const processInputGroupBy = (column: TInputColumn, dbType: string): string => {
  if (column.fn) {
    if (isAllowedFunction(column.fn)) {
      return (dbType === "postgres" ? PostgreSqlFunctions : MySqlColumnFunctions)[column.fn](column);
    }

    throw new Error("Function not allowed: " + column.fn);
  }

  return column.value;
};

export const getAllowedOrderBy = (columns: TInputColumn[], orderBy: OrderByClause[], dbType: DatabaseDialect): OrderByClause[] => {
  if (columns && columns.length > 0) {
    const allowedColumnsMap = columns.reduce((acc, val) => {
      acc.set(inputColumnToAlias(val), {
        isFn: !!(val.fn || val.distinct),
      });

      return acc;
    }, new Map<string, { isFn: boolean }>());

    // only order by columns in group by
    orderBy = orderBy
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

export const processInputColumn = (column: TInputColumn, dbType: DatabaseDialect): string => {
  if (column.fn) {
    if (isAllowedFunction(column.fn)) {
      const colString = (dbType === "postgres" ? PostgreSqlFunctions : MySqlColumnFunctions)[column.fn](column);
      return `${colString} as "${inputColumnToAlias(column)}"`;
    }

    throw new Error("Function not allowed: " + column.fn);
  }

  return escapeColumnName(column.value, dbType);
};