import {TColumn, TColumnFunctionsHandler} from "./index";

const defaultPostgreSqlFunction = (column: TColumn) => {
  const distString: string = column.distinct === true ? 'distinct ' : '';
  return `${column.fn}(${distString}${column.value})`;
};

export const PostgreSqlFunctions: TColumnFunctionsHandler = {
  YEAR: (column) => {
    return `EXTRACT(YEAR FROM ${column.value})`;
  },
  MONTH: (column) => {
    return `EXTRACT(MONTH FROM ${column.value})`;
  },
  DAY: (column) => {
    return `EXTRACT(DAY FROM ${column.value})`;
  },
  SUM: (column) => {
    const distString: string = column.distinct === true ? 'distinct ' : '';
    return `COALESCE(SUM(${distString}${column.value}), 0)`;
  },
  AVG: defaultPostgreSqlFunction,
  MAX: defaultPostgreSqlFunction,
  MIN: defaultPostgreSqlFunction,
  COUNT: defaultPostgreSqlFunction,
};
