export type DatabaseDialect = 'mysql' | 'postgres';

export type QueryType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';

export type FilterValue = string | number | boolean | undefined | null;

export interface QueryFilter {
  column: string;
  operator:
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
    // | 'BETWEEN'
    // | 'NOT BETWEEN'
    // | 'EXISTS'
    // | 'NOT EXISTS'
    ;
  value?: { value: FilterValue; isColumn?: boolean }[];
  connector?: 'AND' | 'OR';
  fn?: string;
  isEnabled?: boolean;
  id: string;
}

export type TQueryOperator = QueryFilter["operator"];

export interface OrderByClause {
  column: string;
  direction: 'ASC' | 'DESC';
}

export interface JoinClause {
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
  table: string;
  alias?: string;
  on: string;
}

export interface SelectQuerySkeleton {
  type: QueryType;
  table?: string;
  columns?: string[];
  values?: any[];
  set?: { [key: string]: any };
  where?: string;
  orderBy?: OrderByClause[];
  limit?: number;
  offset?: number;
  joins?: JoinClause[];
  groupBy?: string[];
  having?: string;
  parameters?: string[]; // List of parameter names found in the query
}
