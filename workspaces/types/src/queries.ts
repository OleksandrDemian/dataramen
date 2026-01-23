import {TInputColumn} from "./queryRunner";

export type TOrderByClause = {
  column: string;
  direction: 'ASC' | 'DESC';
};

export type TJoinClause = {
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
  table: string;
  alias?: string;
  on: string;
};

export type TQueryOperator =
  | '='
  | '!='
  | '<>'
  | '<'
  | '>'
  | '<='
  | '>='
  | 'LIKE'
  | 'NOT LIKE'
  | 'IN'
  | 'NOT IN'
  | 'IS NULL'
  | 'IS NOT NULL'
  | 'CONTAINS'
  | 'NOT CONTAINS'
  | 'RAW'
  // | 'BETWEEN'
  // | 'NOT BETWEEN'
  // | 'EXISTS'
  // | 'NOT EXISTS'
;

export type TQueryFilter = {
  id: string;
  column: string;
  value: string;
  fn?: string;
  isEnabled?: boolean;
  isAdvanced?: boolean;
  isRaw?: boolean;
};

export type TQueryOptions = {
  table: string;
  filters: TQueryFilter[];
  joins: TJoinClause[];
  orderBy: TOrderByClause[];
  columns: TInputColumn[];
  groupBy: TInputColumn[];
  searchAll?: string;
  aggregations: TInputColumn[];
};

export type TCreateQuery = {
  name: string;
  dataSourceId: string;
  opts: Partial<TQueryOptions>;
};

export type TCreateSavedQuery = {
  queryId: string;
  name: string;
};

export type TUpdateQuery = {
  name: string;
  opts: Partial<TQueryOptions>;
};

export type TQuery = {
  id: string;
  name: string;
  opts: Partial<TQueryOptions>;
  createdAt: Date;
  updatedAt: Date;
  dataSource?: {
    id: string;
  };
};

export type TQueryValue = { value: any; isColumn?: boolean; };

