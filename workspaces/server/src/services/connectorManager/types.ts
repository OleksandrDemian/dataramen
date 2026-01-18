import {IDatabaseInspectionSchema, TExecuteQueryResult} from "@dataramen/types";

export type TIntrospectionResult = Omit<IDatabaseInspectionSchema, 'id' | 'datasource'>;

export enum EQueryType {
  SELECT = 'SELECT',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export type TQueryOptions = {
  type: EQueryType;
  allowBulkUpdate?: boolean;
  sql: string;
  params?: any;
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
  executeQuery: (options: TQueryOptions) => Promise<TExecuteQueryResult>;
  checkConnection: () => Promise<void>;
  close: () => Promise<void>;
  isClosed: () => boolean;
};

export type TDynamicConnectionCreator = (dataSource: TDynamicConnectionConfig) => Promise<TDynamicConnection>;
