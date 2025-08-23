import {TColumn, TColumnFunctionsHandler} from "./index";

const defaultMySqlFunction = (column: TColumn) => {
  const distString: string = column.distinct === true ? 'distinct ' : '';
  return `${column.fn}(${distString}${column.value})`;
};

export const MySqlColumnFunctions: TColumnFunctionsHandler = {
  YEAR: (column) => {
    return `YEAR(${column.value})`;
  },
  MONTH: (column) => {
    return `MONTH(${column.value})`;
  },
  DAY: (column) => {
    return `DAY(${column.value})`;
  },
  SUM: (column) => {
    const distString: string = column.distinct === true ? 'distinct ' : '';
    return  `coalesce(${column.fn}(${distString}${column.value}), 0)`;
  },
  AVG: defaultMySqlFunction,
  MAX: defaultMySqlFunction,
  MIN: defaultMySqlFunction,
  COUNT: defaultMySqlFunction,
};
