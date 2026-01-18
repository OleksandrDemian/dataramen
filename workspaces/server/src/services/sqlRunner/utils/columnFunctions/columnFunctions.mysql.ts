import {TColumnFunctionsHandler} from "./index";

const defaultMySqlFunction = (column: string, fn: string, distinct: boolean = false) => {
  if (distinct) {
    return `${fn}(distinct ${column})`;
  }
  return `${fn}(${column})`;
};

export const MySqlColumnFunctions: TColumnFunctionsHandler = {
  YEAR: (column) => {
    return `YEAR(${column})`;
  },
  MONTH: (column) => {
    return `MONTH(${column})`;
  },
  DAY: (column) => {
    return `DAY(${column})`;
  },
  SUM: (column, fn, distinct) => {
    if (distinct) {
      return `coalesce(${fn}(distinct ${column}), 0)`;
    }
    return `coalesce(${fn}(${column}), 0)`;
  },
  AVG: defaultMySqlFunction,
  MAX: defaultMySqlFunction,
  MIN: defaultMySqlFunction,
  COUNT: defaultMySqlFunction,
};
