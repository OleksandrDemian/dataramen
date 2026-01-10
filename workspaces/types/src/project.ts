import {IDataSource, IQuery, IWorkbenchTab} from "./schemas";

export type TFindQuery = {
  id: string;
  name: string;
  dataSourceName: string;
  dataSourceId: string;
  type: 'table' | 'tab' | 'query';
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
  datasourceType: string;
  datasourceName: string;
};

export type TProjectTabsHistoryEntry = Pick<IWorkbenchTab, 'id' | 'name' | 'archived' | 'createdAt' | 'updatedAt'> & {
  dataSourceName?: string;
  dataSourceId?: string;
  dataSourceType?: string;
};
