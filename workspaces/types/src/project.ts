export type TFindQuery = {
  id: string;
  name: string;
  dataSourceName: string;
  dataSourceId: string;
  type: 'table' | 'query';
};
