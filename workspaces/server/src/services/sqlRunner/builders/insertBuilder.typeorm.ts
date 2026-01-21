import {IDataSource} from "@dataramen/types";
import {getDatasourceQueryBuilder} from "../utils/base";
import {IInsertQueryBuilder, IUpdateQueryBuilder} from "./types";
import {buildQueryFilterCondition} from "../utils/filter";

export const createTypeormInsertBuilder = (table: string, dataSource: IDataSource): IInsertQueryBuilder => {
  const queryBuilder = getDatasourceQueryBuilder(dataSource.dbType)
    .insert()
    .into(table);

  return {
    setValues(values) {
      const inputValues: Record<string, unknown> = {};
      for (const [column, value] of Object.entries(values)) {
        const strValue = `${value}`;
        if (strValue.startsWith("=")) {
          inputValues[column] = () => strValue.substring(1);
        } else {
          inputValues[column] = strValue;
        }
      }

      queryBuilder.values([inputValues]);
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
