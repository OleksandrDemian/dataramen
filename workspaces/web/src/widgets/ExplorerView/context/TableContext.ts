import {createContext} from "react";
import {TRunQueryResult} from "../../../data/types/queryRunner.ts";
import {
  TDbValue,
  TInputColumn,
  TRunSqlResult,
  TRunWorkbenchQuery, TWorkbenchOptions
} from "@dataramen/types";
import {THook} from "../../../data/types/hooks.ts";
import {UseQueryResult} from "react-query";
import {createTableOptions} from "../utils.ts";

export type TTableContext = {
  name: string;
  tabId?: string;
  hooks: THook[];
  availableJoins: THook[];
  allColumns: TRunSqlResult["allColumns"];
  dataSourceId: string;
  entities: string[];
  getValue: (row: TRunQueryResult['rows'][0], column: TInputColumn) => TDbValue;
  getEntityKey: (entity: string, row: TRunQueryResult['rows'][0]) => [string, TDbValue][];
  getColumnType: (fullColumn: string) => string | undefined;
};

export const TableContext = createContext<TTableContext>({
  name: 'No name',
  hooks: [],
  availableJoins: [],
  allColumns: [],
  dataSourceId: '',
  entities: [],
  getValue: () => undefined,
  getColumnType: () => undefined,
  getEntityKey: () => [],
});

export type TTableOptionsUpdater = (fn: (opts: TWorkbenchOptions) => TWorkbenchOptions) => void;

export type TTableOptionsContext = {
  state: TWorkbenchOptions;
  setState: TTableOptionsUpdater;
};

export const TableOptionsContext = createContext<TTableOptionsContext>({
  state: createTableOptions({}),
  setState: () => {},
});

export const QueryResultContext = createContext<UseQueryResult<TRunWorkbenchQuery>>({} as any);
