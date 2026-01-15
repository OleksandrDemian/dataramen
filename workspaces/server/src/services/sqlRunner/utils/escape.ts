import {
  DatabaseDialect,
  isAllowedFunction,
  MySqlColumnFunctions,
  PostgreSqlFunctions,
} from "@dataramen/sql-builder";
import { inputColumnToAlias } from "@dataramen/common";
import { TInputColumn } from "@dataramen/types";
import {DatasourceDriver} from "./base";

export const escapeColumnName = (column: string, dbType: DatabaseDialect): string => {
  const driver = DatasourceDriver[dbType];

  if (column.includes(".")) {
    const [table, col] = column.split(".");
    return driver.escape(table) + '.' + driver.escape(col);
  }

  return driver.escape(column);
};

export const escapeInputColumn = (column: TInputColumn, dbType: DatabaseDialect): string => {
  if (column.fn) {
    if (isAllowedFunction(column.fn)) {
      const colString = (dbType === "postgres" ? PostgreSqlFunctions : MySqlColumnFunctions)[column.fn]({
        value: escapeColumnName(column.value, dbType),
        fn: column.fn,
        distinct: column.distinct,
      });

      return `${colString} as "${inputColumnToAlias(column)}"`;
    }

    throw new Error("Function not allowed: " + column.fn);
  }

  return `${escapeColumnName(column.value, dbType)} as "${column.value}"`;
};