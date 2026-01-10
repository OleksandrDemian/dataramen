import {JoinClause, OrderByClause} from "@dataramen/sql-builder";
import {TInputColumn} from "./queryRunner";

export type TQueryFilter = {
  id: string;
  column: string;
  value: string;
  isEnabled?: boolean;
  isAdvanced?: boolean;
};

export type TQueryOptions = {
  table: string;
  filters: TQueryFilter[];
  joins: JoinClause[];
  orderBy: OrderByClause[];
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
