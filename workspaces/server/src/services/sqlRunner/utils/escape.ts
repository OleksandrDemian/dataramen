import {
  TDatabaseDialect,
} from "@dataramen/types";
import {DatasourceDriver} from "./base";

export const getEscaper = (dbType: TDatabaseDialect) => {
  const driver = DatasourceDriver[dbType];
  return (column: string): string => {
    if (column.includes(".")) {
      const [table, col] = column.split(".");
      return driver.escape(table) + '.' + driver.escape(col);
    }

    if (column === '*') return column;

    return driver.escape(column);
  };
};
