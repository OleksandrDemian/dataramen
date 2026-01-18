import {TDatabaseDialect} from "@dataramen/types";
import {IWhere} from "../builders/types";

export const buildQueryFilterCondition = (condition: IWhere, index: number, dbType: TDatabaseDialect): [string, Record<string, any>] => {
  const { column, operator, value} = condition;
  const propName = "_" + index;

  switch (operator) {
    case 'IS NULL':
    case 'IS NOT NULL':
      return [`${column} ${operator}`, { value: undefined }];
    case 'IN':
    case 'NOT IN':
      return [`${column} ${operator} (:...${propName})`, {
        [propName]: value?.map((v) => v.value),
      }];
    case "LIKE":
    case "CONTAINS":
      const like = dbType === "postgres" ? "ILIKE" : "LIKE";
      return [`${column} ${like} :${propName}`, {
        [propName]: operator === "CONTAINS" ? `%${value?.[0].value}%`: value?.[0].value,
      }];
    case "NOT LIKE":
    case "NOT CONTAINS":
      const notLike = dbType === "postgres" ? "NOT ILIKE" : "NOT LIKE";
      return [`${column} ${notLike} :${propName}`, {
        [propName]: operator === "NOT CONTAINS" ? `%${value?.[0].value}%`: value?.[0].value,
      }];
    default:
      return [`${column} ${operator} :${propName}`, {
        [propName]: value?.[0]?.value,
      }];
  }
};
