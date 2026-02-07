import {TTableContext, TTableOptionsContext, TTableOptionsUpdater} from "./context/TableContext.ts";
import {
  TRunWorkbenchQuery,
  TWorkbenchOptions
} from "@dataramen/types";
import {useMemo} from "react";

export function useCreateTableContext (
  result: TRunWorkbenchQuery | undefined,
  dataSourceId: string,
  name: string,
  tabId?: string,
): TTableContext {
  return useMemo<TTableContext>(() => {
    return {
      name,
      tabId,
      hooks: result?.result.availableHooks || [],
      availableJoins: result?.result?.availableJoins || [],
      allColumns: result?.result.allColumns || [],
      dataSourceId: dataSourceId,
      entities: result?.result.availableEntities || [],
      getValue: (row, table: string, column: string) => {
        const index = result?.result.columns?.findIndex((col) => {
          return col.table === table && col.column === column;
        });

        if (index != undefined && index > -1) {
          return result?.result?.rows[row][index];
        }

        return undefined;
      },
      getColumnByIndex: (index: number) => {
        return result?.result?.columns?.[index];
      },
      getValueByIndex: (row, col) => {
        return result?.result?.rows[row]?.[col];
      },
      getColumnType: (fullColumn: string) => {
        const meta = result?.result.allColumns.find((c) => c.full === fullColumn);

        if (meta) {
          return meta.type;
        }

        return undefined;
      }
    };
  }, [result, dataSourceId, name, tabId]);
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