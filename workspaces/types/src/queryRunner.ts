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
};

export type TExecuteGetEntityProps = {
  dataSourceId: string;
  table: string;
  props: Record<string, string>;
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
  type?: string;
};

export type TExecuteQueryResult = {
  columns: TResultColumn[];
  rows: TDbValue[][];
  query: string;
};

export type TExecuteGetEntityResponse = {
  entity: Record<string, any>;
  columns: TResultColumn[];
  sql: string;
};

export type TRunSqlResult = TExecuteQueryResult & {
  tables: string[];
  queryHistoryId: string;
  hasMore: boolean;
  allColumns: {
    table: string;
    column: string;
    full: string;
    type: string;
  }[];
};
