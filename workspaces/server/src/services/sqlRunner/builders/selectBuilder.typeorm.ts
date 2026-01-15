import {
  DatabaseDialect,
  JoinClause,
  QueryFilter,
} from "@dataramen/sql-builder";
import {IDataSource, TInputColumn} from "@dataramen/types";
import {getDatasourceQueryBuilder} from "../utils/base";
import {ISelectQueryBuilder} from "./types";
import {processInputGroupBy} from "../utils";
import {buildQueryFilterCondition} from "../utils/filter";

export function createTypeormSelectBuilder (table: string, dataSource: IDataSource): ISelectQueryBuilder {
  const queryBuilder = getDatasourceQueryBuilder(dataSource.dbType as DatabaseDialect)
    .from(table, table);
  let hasLimit = false;
  let paramIndex = 0;

  return {
    setColumns (columns) {
      queryBuilder.select(columns);
    },
    addColumn(column, alias) {
      queryBuilder.addSelect(column, alias);
    },
    setLimit: (limit) => {
      queryBuilder.limit(limit);
      hasLimit = true;
    },
    setOffset(offset) {
      queryBuilder.skip(offset);
    },
    addOrderBy(col, orderBy) {
      queryBuilder.addOrderBy(col, orderBy);
    },
    addJoin({ table, alias, on }: JoinClause) {
      queryBuilder.leftJoin(table, alias || table, on);
    },
    addWhere(filter: QueryFilter) {
      const [filterString, value] = buildQueryFilterCondition(filter, ++paramIndex, dataSource.dbType as DatabaseDialect);
      queryBuilder.andWhere(filterString, value);
    },
    addHaving(having: QueryFilter) {
      const [filterString, value] = buildQueryFilterCondition(having, ++paramIndex, dataSource.dbType as DatabaseDialect);
      queryBuilder.andHaving(filterString, value);
    },
    addGroupBy(groupBy: TInputColumn) {
      queryBuilder.addGroupBy(processInputGroupBy(groupBy, dataSource.dbType));
    },

    build(): { sql: string; params: any } {
      if (!hasLimit) {
        queryBuilder.limit(50); // default limit 50
      }

      const [sql, params] = queryBuilder.getQueryAndParameters();
      return { sql, params };
    }
  };
}
