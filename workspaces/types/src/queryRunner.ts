import {TQueryFilter, TQueryOptions} from "./queries";
import {IInspectionColumnRef} from "./schemas";

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

export type TExecuteUpdate = {
  datasourceId: string;
  table: string;
  filters: TQueryFilter[];
  values: Record<string, unknown>;
};

export type TExecuteInsert = {
  datasourceId: string;
  table: string;
  values: Record<string, unknown>;
};

export type TResultColumn = {
  column: string;
  table?: string;
  alias: string;
  full: string;
  type?: string;
  fn?: string;
  ref?: IInspectionColumnRef;
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
