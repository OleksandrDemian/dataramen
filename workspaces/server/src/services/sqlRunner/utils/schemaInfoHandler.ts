import {DatabaseColumnRepository, DatabaseTableRepository} from "../../../repository/db";
import {In} from "typeorm";
import {IDatabaseColumnSchema, IInspectionColumnRef, TRunSqlResult} from "@dataramen/types";

export type TGetColumnType = (col: string) => string;
export type TGetColumnByName = (table: string, column: string) => IDatabaseColumnSchema | undefined;

export const createSchemaInfoHandler = async (id: string, tables: string[]) => {
  const info = await DatabaseColumnRepository.find({
    where: {
      table: {
        name: In(tables),
        datasource: { id },
      },
    },
    relations: { table: true },
    order: {
      table: {
        name: "ASC",
      },
      isPrimary: "DESC",
      name: "ASC",
    },
  });

  const allColumns: TRunSqlResult["allColumns"] = [];
  for (const column of info) {
    allColumns.push({
      column: column.name,
      table: column.table.name || '',
      full: `${column.table.name}.${column.name}`,
      type: column.type,
    });
  }

  const columnTypes = allColumns.reduce((acc, cur) => {
    acc[cur.full] = cur.type;
    return acc;
  }, {} as Record<string, string>);

  const getColumnByName: TGetColumnByName = (table: string, column: string) => {
    for (const temp of info) {
      if (temp.name === column && temp.table.name === table) {
        return temp;
      }
    }

    return undefined;
  };

  return {
    getAllColumns (): TRunSqlResult["allColumns"] {
      return allColumns;
    },
    hasColumn(column: string): boolean {
      return !!columnTypes[column] || column === "*";
    },
    getColumnByName,
  };
};
