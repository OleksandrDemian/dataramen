import {TColumnFunctionsHandler} from "./index";

const defaultPostgreSqlFunction = (column: string, fn: string, distinct: boolean = false) => {
  if (distinct) {
    return `${fn}(distinct ${column})`;
  }
  return `${fn}(${column})`;
};

export const PostgreSqlFunctions: TColumnFunctionsHandler = {
  YEAR: (column) => {
    return `EXTRACT(YEAR FROM ${column})`;
  },
  MONTH: (column) => {
    return `EXTRACT(MONTH FROM ${column})`;
  },
  DAY: (column) => {
    return `EXTRACT(DAY FROM ${column})`;
  },
  SUM: (column, fn, distinct) => {
    if (distinct) {
      return `COALESCE(SUM(distinct ${column}), 0)`;
    }
    return `COALESCE(SUM(${column}), 0)`;
  },
  AVG: defaultPostgreSqlFunction,
  MAX: defaultPostgreSqlFunction,
  MIN: defaultPostgreSqlFunction,
  COUNT: defaultPostgreSqlFunction,
};
