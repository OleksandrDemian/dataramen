import {OrderByClause, SelectQuerySkeleton, QueryFilter, FilterValue, DatabaseDialect} from "./types";
import {transformColumn} from "./columnFunctions";

export const isString = (value: any): value is string => {
  return typeof value === 'string';
};

export const buildSelect = (skeleton: SelectQuerySkeleton): string => {
  let sql = 'SELECT ';

  if (skeleton.columns && skeleton.columns.length > 0) {
    sql += skeleton.columns.join(', ');
  } else {
    sql += '*';
  }

  if (skeleton.table) {
    sql += ` FROM ${skeleton.table}`;
  }

  if (skeleton.joins && skeleton.joins.length > 0) {
    skeleton.joins.forEach(join => {
      sql += ` ${join.type} JOIN ${join.table} ON ${join.on}`;
    });
  }

  if (skeleton.where) {
    sql += ` WHERE ${skeleton.where}`;
  }

  if (skeleton.groupBy && skeleton.groupBy.length > 0) {
    sql += ` GROUP BY ${skeleton.groupBy.join(', ')}`;
  }

  if (skeleton.having) {
    sql += ` HAVING ${skeleton.having}`;
  }

  if (skeleton.orderBy && skeleton.orderBy.length > 0) {
    const uniqueOrderBy = skeleton.orderBy.reduce((acc, curr) => {
      acc[curr.column] = curr.direction;
      return acc;
    }, {} as Record<string, OrderByClause["direction"]>);

    const orderClauses = Object.entries(uniqueOrderBy).map(([column, direction]) =>
      `${column} ${direction}`
    );
    sql += ` ORDER BY ${orderClauses.join(', ')}`;
  }

  if (skeleton.limit !== undefined) {
    sql += ` LIMIT ${skeleton.limit}`;
  }

  if (skeleton.offset !== undefined) {
    sql += ` OFFSET ${skeleton.offset}`;
  }

  return sql;
};

export const buildQueryFilterCondition = (condition: QueryFilter, dbType: DatabaseDialect): string => {
  const { column, operator, value, fn } = condition;

  const columnStr = transformColumn({
    value: column,
    fn,
  }, dbType);

  switch (operator) {
    case 'IS NULL':
    case 'IS NOT NULL':
      return `${columnStr} ${operator}`;
    case 'IN':
    case 'NOT IN':
      const values = value?.map(v => isString(v.value) ? `'${v.value}'` : v.value).join(', ');
      return `${columnStr} ${operator} (${values})`;
    case "LIKE":
      const like = dbType === "postgres" ? "ILIKE" : "LIKE";
      return `${columnStr} ${like} '%${value?.[0].value}%'`;
    case "NOT LIKE":
      const notLike = dbType === "postgres" ? "NOT ILIKE" : "LIKE";
      return `${columnStr} ${notLike} '%${value?.[0].value}%'`;
    default:
      const val = value?.[0];
      let formattedValue: FilterValue | undefined;
      if (isString(val?.value) && val?.isColumn !== true) {
        formattedValue = `'${val?.value}'`;
      } else {
        formattedValue = val?.value;
      }

      return `${columnStr} ${operator} ${formattedValue}`;
  }
};
