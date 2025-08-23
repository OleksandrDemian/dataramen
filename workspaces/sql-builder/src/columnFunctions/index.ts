import {DatabaseDialect} from "../types";
import {PostgreSqlFunctions} from "./columnFunctions.postgres";
import {MySqlColumnFunctions} from "./columnFunctions.mysql";

export const AGGREGATION_FUNCTIONS = ["SUM", "COUNT", "AVG", "MAX", "MIN"] as const;

export const COLUMN_FUNCTIONS = [
  "YEAR",
  "MONTH",
  "DAY",
  ...AGGREGATION_FUNCTIONS,
] as const;

export type TColumn = {
  distinct?: boolean;
  fn?: string;
  value: string;
};
export type TColumnFunction = typeof COLUMN_FUNCTIONS[number];
export type TAggregationFunction = typeof AGGREGATION_FUNCTIONS[number];

export type TColumnFunctionsHandler = {
  [key in TColumnFunction]: (column: TColumn) => string;
};

export const ALLOWED_COLUMN_FUNCTIONS = COLUMN_FUNCTIONS.reduce((acc, val) => {
  acc[val] = true;
  return acc;
}, {} as Record<string, true>);

export const ALLOWED_AGGREGATION_FUNCTIONS = AGGREGATION_FUNCTIONS.reduce((acc, val) => {
  acc[val] = true;
  return acc;
}, {} as Record<string, true>);

export const isAllowedFunction = (fn: string): fn is TColumnFunction => {
  return ALLOWED_COLUMN_FUNCTIONS[fn];
};

export const isAggregationFunction = (fn: string): fn is TAggregationFunction => {
  return ALLOWED_AGGREGATION_FUNCTIONS[fn];
};

export const transformColumn = (column: TColumn, dbType: DatabaseDialect) => {
  if (column.fn && isAllowedFunction(column.fn)) {
    return (dbType === "postgres" ? PostgreSqlFunctions : MySqlColumnFunctions)[column.fn](column);
  }

  return column.value;
};
