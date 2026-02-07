import {IDataSource, TDatabaseDialect, TJoinClause} from "@dataramen/types";
import {getDatasourceQueryBuilder} from "../utils/base";
import {ISelectColumn, ISelectQueryBuilder} from "./types";
import {buildQueryFilterCondition} from "../utils/filter";
import {getEscaper} from "../utils/escape";
import {isAllowedFunction} from "../utils/columnFunctions";
import {PostgreSqlFunctions} from "../utils/columnFunctions/columnFunctions.postgres";
import {MySqlColumnFunctions} from "../utils/columnFunctions/columnFunctions.mysql";

const selectColumnToAlias = (column: ISelectColumn): string => {
  const tokens: string[] = [];
  if (column.fn) {
    tokens.push(column.fn);
  }

  if (column.distinct) {
    tokens.push("distinct");
  }

  tokens.push(column.column);
  return tokens.join(" ");
}

const selectColumnParser = (dbType: TDatabaseDialect) => {
  const escaper = getEscaper(dbType);
  const fnProcessor = dbType === "postgres" ? PostgreSqlFunctions : MySqlColumnFunctions;

  return (column: ISelectColumn) => {
    if (column.fn && isAllowedFunction(column.fn)) {
      return fnProcessor[column.fn](
        escaper(column.column),
        column.fn,
        column.distinct,
      );
    }

    return escaper(column.column);
  };
};

export function createTypeormSelectBuilder (table: string, dataSource: IDataSource): ISelectQueryBuilder {
  const queryBuilder = getDatasourceQueryBuilder(dataSource.dbType)
    .from(table, table);
  let hasLimit = false;
  let paramIndex = 0;
  const parser = selectColumnParser(dataSource.dbType);
  const columnAliases: Record<string, string> = {};

  return {
    setColumns (columns) {
      columns.forEach((c) => {
        const alias = selectColumnToAlias(c);
        columnAliases[alias] = alias;
        queryBuilder.addSelect(
          parser(c),
          alias,
        );
      });
    },
    setLimit: (limit) => {
      queryBuilder.limit(limit);
      hasLimit = true;
    },
    setOffset(offset) {
      queryBuilder.offset(offset);
    },
    addOrderBy(col, orderBy) {
      queryBuilder.addOrderBy(col, orderBy);
    },
    addJoin({ table, alias, on }: TJoinClause) {
      queryBuilder.leftJoin(table, alias || table, on);
    },
    addWhere(filter) {
      const [filterString, value] = buildQueryFilterCondition({
        ...filter,
        operator: filter.operator || "=",
        column: parser(filter),
      }, ++paramIndex, dataSource.dbType);
      queryBuilder.andWhere(filterString, value);
    },
    addHaving(having) {
      const [filterString, value] = buildQueryFilterCondition({
        ...having,
        operator: having.operator || "=",
        column: parser(having),
      }, ++paramIndex, dataSource.dbType);
      queryBuilder.andHaving(filterString, value);
    },
    addGroupBy(groupBy: ISelectColumn) {
      queryBuilder.addGroupBy(
        parser(groupBy)
      );
    },

    hasAlias(alias: string): boolean {
      return !!columnAliases[alias];
    },

    build(): { sql: string; params: any } {
      if (!hasLimit) {
        queryBuilder.limit(50); // default limit 50
      }

      const [sql, params] = queryBuilder.getQueryAndParameters();
      return { sql, params };
    },
  };
}
