import {IDataSource, IQuery} from "./schemas";

export type TFindQuery = {
  id: string;
  name: string;
  dataSourceName: string;
  dataSourceId: string;
  type: 'table' | 'query';
};

export type TProjectDataSource = Pick<
  IDataSource,
  'id' |
  'name' |
  'updatedAt' |
  'dbType' |
  'description' |
  'allowInsert' |
  'allowUpdate'
>;

export type TProjectQuery = Pick<
  IQuery,
  'id' |
  'name' |
  'updatedAt'
> & {
  savedQueryId: string;
};
