import {TTableContext, TTableOptionsContext, TTableOptionsUpdater} from "./context/TableContext.ts";
import {THook} from "../../data/types/hooks.ts";
import {TDbValue, TExecuteQueryResult, TRunWorkbenchQuery, TWorkbenchOptions} from "@dataramen/types";
import {useHooks} from "../../data/queries/hooks.ts";
import {useMemo} from "react";
import {TDatabaseInspection} from "../../data/types/dataSources.ts";
import {useDatabaseInspections} from "../../data/queries/dataSources.ts";
import { inputColumnToAlias } from "@dataramen/common";

function getEntities (inspections?: TDatabaseInspection[], resultColumns?: TExecuteQueryResult["columns"]): Record<string, string[]> {
  // todo improve this shit
  if (!inspections || !resultColumns) {
    return {};
  }

  const entities = new Set<string>();
  for (const col of resultColumns) {
    if (col.table) {
      entities.add(col.table);
    }
  }

  const result: Record<string, string[]> = {};

  for (const ent of entities) {
    const insp = inspections.find((ins) => ins.tableName === ent);
    if (insp) {
      result[ent] = [];
      const fields = insp.columns.filter((col) => col.isPrimary);
      for (const field of fields) {
        const isPresent = resultColumns.find(
          (col) => col.table === ent && col.column === field.name
        );
        if (!isPresent) {
          delete result[ent];
          break;
        } else {
          result[ent].push(field.name);
        }
      }
    }
  }

  return result;
}

export function useCreateTableContext (
  result: TRunWorkbenchQuery | undefined,
  dataSourceId: string,
  name: string,
  tabId?: string,
): TTableContext {
  const { data: hooks } = useHooks(dataSourceId);
  const { data: inspections } = useDatabaseInspections(dataSourceId);

  return useMemo<TTableContext>(() => {
    const entities = getEntities(inspections, result?.result.columns);

    return {
      name,
      tabId,
      hooks: (() => {
        const filtered: THook[] = [];
        if (!hooks || !result || !result.result.columns) {
          return filtered;
        }

        for (const hook of hooks) {
          if (result.result.tables.includes(hook.on.toTable) || result.result.tables.includes(hook.on.fromTable)) {
            filtered.push(hook);
          }
        }

        return filtered;
      })(),
      availableJoins: (() => {
        const filtered: THook[] = [];
        if (!hooks || !result || !result.result.columns) {
          return filtered;
        }

        for (const hook of hooks) {
          if (!result.result.tables.includes(hook.on.toTable) && result.result.tables.includes(hook.on.fromTable)) {
            filtered.push(hook);
          }
        }

        return filtered;
      })(),
      allColumns: result?.result.allColumns || [],
      dataSourceId: dataSourceId,
      entities: Object.keys(entities),
      getValue: (row, col) => {
        const alias = inputColumnToAlias(col);
        const index = result?.result.columns?.findIndex((column) => {
          return column.full === alias;
        });

        if (index != undefined && index > -1) {
          return row[index];
        }

        return undefined;
      },
      getEntityKey: (entity, row) => {
        return entities[entity].reduce<[string, TDbValue][]>((acc, col) => {
          const index = result?.result.columns?.findIndex((column) => {
            return column.column === col && column.table === entity;
          });

          if (index != undefined && index > -1) {
            acc.push([col, row[index]]);
          }

          return acc;
        }, []);
      },
      getEntityKeyByRowIndex: (entity, row) => {
        return entities[entity].reduce<[string, TDbValue][]>((acc, col) => {
          const index = result?.result.columns?.findIndex((column) => {
            return column.column === col && column.table === entity;
          });

          if (index != undefined && index > -1) {
            acc.push([col, result?.result.rows[row][index]]);
          }

          return acc;
        }, []);
      },
      getColumnType: (fullColumn: string) => {
        const meta = result?.result.allColumns.find((c) => c.full === fullColumn);

        if (meta) {
          return meta.type;
        }

        return undefined;
      }
    };
  }, [result, dataSourceId, hooks, inspections, name]);
}

export function useCreateTableOptionsContext (
  options: TWorkbenchOptions,
  updater: TTableOptionsUpdater,
): TTableOptionsContext {
  return useMemo(() => ({
    state: options,
    setState: updater,
  }), [options, updater]);
}

export function createTableOptions (options: Partial<TWorkbenchOptions>): TWorkbenchOptions {
  return {
    dataSourceId: options.dataSourceId || "",
    page: options?.page || 0,
    size: options?.size || 50,
    table: options.table || '',
    filters: options?.filters || [],
    joins: options?.joins ?? [],
    orderBy: options?.orderBy ?? [],
    columns: options?.columns ?? [],
    groupBy: options?.groupBy ?? [],
    aggregations: options?.aggregations ?? [],
  };
}