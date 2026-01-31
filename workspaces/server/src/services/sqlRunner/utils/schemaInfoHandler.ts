import {DatabaseTableRepository} from "../../../repository/db";
import {In} from "typeorm";
import {IInspectionColumnRef, TRunSqlResult} from "@dataramen/types";

export type TGetColumnType = (col: string) => string;

export const createSchemaInfoHandler = async (id: string, tables: string[]) => {
  const info = await DatabaseTableRepository.find({
    where: {
      name: In(tables),
      datasource: { id },
    },
    relations: { columns: true },
    order: {
      name: "ASC",
      columns: {
        name: "ASC",
      },
    },
  });

  const allColumns: TRunSqlResult["allColumns"] = [];
  for (const table of info) {
    if (!table.columns) continue;

    for (const column of table.columns) {
      allColumns.push({
        column: column.name,
        table: table.name || '',
        full: `${table.name}.${column.name}`,
        type: column.type,
      });
    }
  }

  const columnTypes = allColumns.reduce((acc, cur) => {
    acc[cur.full] = cur.type;
    return acc;
  }, {} as Record<string, string>);

  const getColumnType: TGetColumnType = (column: string) => {
    return columnTypes[column];
  };

  const getColumnRef = (table: string, column: string): IInspectionColumnRef | undefined => {
    for (const inspection of info) {
      if (inspection.name !== table) {
        continue;
      }

      for (const temp of inspection.columns!) {
        if (temp.name === column && temp.meta?.refs) {
          return temp.meta?.refs;
        }
      }
    }

    return undefined;
  };

  return {
    getAllColumns (): TRunSqlResult["allColumns"] {
      return allColumns;
    },
    getColumnType,
    hasColumn(column: string): boolean {
      return !!columnTypes[column] || column === "*";
    },
    getColumnRef,
  };
};
