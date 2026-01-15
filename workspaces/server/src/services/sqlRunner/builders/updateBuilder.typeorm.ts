import { IDataSource } from "@dataramen/types";
import {DatabaseDialect, QueryFilter} from "@dataramen/sql-builder";
import {getDatasourceQueryBuilder} from "../utils/base";
import {IUpdateQueryBuilder} from "./types";
import {buildQueryFilterCondition} from "../utils/filter";

export const createTypeormUpdateBuilder = (table: string, dataSource: IDataSource): IUpdateQueryBuilder => {
  const queryBuilder = getDatasourceQueryBuilder(dataSource.dbType as DatabaseDialect)
    .update(table);
  let paramIndex = 0;

  return {
    addWhere(filter: QueryFilter) {
      const [filterString, value] = buildQueryFilterCondition(filter, ++paramIndex, dataSource.dbType as DatabaseDialect);
      queryBuilder.andWhere(filterString, value);
    },
    setParams(params: any) {
      queryBuilder.set(params);
    },
    build() {
      const [sql, params] = queryBuilder.getQueryAndParameters();
      return {
        sql,
        params,
      };
    }
  }
};
