import {IDatabaseInspectionSchema, TExecuteQueryResult} from "@dataramen/types";
import {QueryType} from "@dataramen/sql-builder";

export type TIntrospectionResult = Omit<IDatabaseInspectionSchema, 'id' | 'datasource'>;

export type TQueryOptions = {
  type: QueryType;
  allowBulkUpdate?: boolean;
};

export type TDynamicConnectionConfig = {
  url: string;
  port?: number;
  user: string;
  password?: string;
  database: string;
  schema?: string;
};

export type TDynamicConnection = {
  dbType: string;
  dataSource: TDynamicConnectionConfig;
  inspectSchema: () => Promise<TIntrospectionResult[]>;
  executeQuery: (query: string, options: TQueryOptions) => Promise<TExecuteQueryResult>;
  checkConnection: () => Promise<void>;
  close: () => Promise<void>;
  isClosed: () => boolean;
};

export type TDynamicConnectionCreator = (dataSource: TDynamicConnectionConfig) => Promise<TDynamicConnection>;
