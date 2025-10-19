import {QueryFilter} from "@dataramen/sql-builder";
import {TQueryOptions} from "./queries";

export type TDbValue = (string | number | boolean | undefined | null);
export type TInputColumn = {
  distinct?: boolean;
  fn?: string;
  value: string;
};

export type TExecuteQuery = {
  datasourceId: string;
  page: number;
  size: number;
  opts: TQueryOptions;
  name: string;
  workbenchTabId?: string;
};

export type TQueryMutationValue = { column: string; value: TDbValue; };

export type TExecuteUpdate = {
  datasourceId: string;
  table: string;
  filters: QueryFilter[];
  values: TQueryMutationValue[];
};

export type TExecuteInsert = {
  datasourceId: string;
  table: string;
  values: TQueryMutationValue[];
};

export type TResultColumn = {
  column: string;
  table?: string;
  alias: string;
  full: string;
};

export type TExecuteQueryResult = {
  columns: TResultColumn[];
  rows: TDbValue[][];
  query: string;
};

export type TRunSqlResult = TExecuteQueryResult & {
  tables: string[];
  queryHistoryId: string;
  allColumns: {
    table: string;
    column: string;
    full: string;
    type: string;
  }[];
};

export type TExecuteRawQuery = {
  datasourceId?: string;
  sql: string;
  page?: number;
  size?: number;
};
