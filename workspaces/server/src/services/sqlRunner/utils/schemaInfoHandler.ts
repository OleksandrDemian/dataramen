import {DatabaseColumnRepository} from "../../../repository/db";
import {In} from "typeorm";
import {IDatabaseColumnSchema, IHook, TRunSqlResult} from "@dataramen/types";

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

  const getAvailableJoins = (): IHook[] => {
    const hooks: IHook[] = [];
    const excludeTables = new Set<string>(tables);

    for (const column of info) {
      column.meta?.referencedBy?.forEach((ref) => {
        if (!excludeTables.has(ref.table)) {
          hooks.push({
            id: [ref.table, ref.field, column.name, column.table.name].join("."),
            fromColumn: ref.field,
            fromTable: ref.table,
            toColumn: column.name,
            toTable: column.table.name,
            direction: 'in',
          });
        }
      });

      if (column.meta?.refs) {
        const ref = column.meta.refs;
        if (!excludeTables.has(ref.table)) {
          hooks.push({
            id: [column.name, column.table.name, ref.table, ref.field].join("."),
            fromColumn: column.name,
            fromTable: column.table.name,
            toColumn: ref.field,
            toTable: ref.table,
            direction: 'out',
          });
        }
      }
    }

    return hooks;
  };

  return {
    getAllColumns (): TRunSqlResult["allColumns"] {
      return allColumns;
    },
    hasColumn(column: string): boolean {
      return !!columnTypes[column] || column === "*";
    },
    getAvailableJoins: getAvailableJoins,
    getColumnByName: getColumnByName,
  };
};
