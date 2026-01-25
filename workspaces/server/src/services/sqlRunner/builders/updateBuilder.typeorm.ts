import {IDataSource} from "@dataramen/types";
import {getDatasourceQueryBuilder} from "../utils/base";
import {IUpdateQueryBuilder} from "./types";
import {buildQueryFilterCondition} from "../utils/filter";

export const createTypeormUpdateBuilder = (table: string, dataSource: IDataSource): IUpdateQueryBuilder => {
  const queryBuilder = getDatasourceQueryBuilder(dataSource.dbType)
    .update(table);
  let paramIndex = 0;

  return {
    addWhere(filter) {
      const [filterString, value] = buildQueryFilterCondition(filter, ++paramIndex, dataSource.dbType);
      queryBuilder.andWhere(filterString, value);
    },
    setParams(params) {
      const inputParams: Record<string, unknown> = {};
      for (const [column, value] of Object.entries(params)) {
        const strValue = `${value}`;
        if (strValue.startsWith("=")) {
          inputParams[column] = () => strValue.substring(1);
        } else {
          inputParams[column] = strValue;
        }
      }
      queryBuilder.set(inputParams);
    },
    build() {
      const [sql, params] = queryBuilder.getQueryAndParameters();
      return {
        sql,
        params,
      };
    },
  }
};
