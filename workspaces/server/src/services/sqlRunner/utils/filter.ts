import {DatabaseDialect, QueryFilter, transformColumn} from "@dataramen/sql-builder";
import {escapeColumnName} from "./escape";

export const buildQueryFilterCondition = (condition: QueryFilter, index: number, dbType: DatabaseDialect): [string, Record<string, any>] => {
  const { column, operator, value, fn } = condition;

  const columnStr = transformColumn({
    value: escapeColumnName(column, dbType),
    fn,
  }, dbType);
  const propName = "_" + index;

  switch (operator) {
    case 'IS NULL':
    case 'IS NOT NULL':
      return [`${columnStr} ${operator}`, { value: undefined }];
    case 'IN':
    case 'NOT IN':
      return [`${columnStr} ${operator} (:...${propName})`, {
        [propName]: value?.map((v) => v.value),
      }];
    case "LIKE":
    case "CONTAINS":
      const like = dbType === "postgres" ? "ILIKE" : "LIKE";
      return [`${columnStr} ${like} :${propName}`, {
        [propName]: operator === "CONTAINS" ? `%${value?.[0].value}%`: value?.[0].value,
      }];
    case "NOT LIKE":
    case "NOT CONTAINS":
      const notLike = dbType === "postgres" ? "NOT ILIKE" : "NOT LIKE";
      return [`${columnStr} ${notLike} :${propName}`, {
        [propName]: operator === "NOT CONTAINS" ? `%${value?.[0].value}%`: value?.[0].value,
      }];
    default:
      return [`${columnStr} ${operator} :${propName}`, {
        [propName]: value?.[0]?.value,
      }];
  }
};
