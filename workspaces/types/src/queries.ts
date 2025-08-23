import {JoinClause, OrderByClause, QueryFilter} from "@dataramen/sql-builder";
import {TInputColumn} from "./queryRunner";

export type TQueryOptions = {
  table: string;
  filters: QueryFilter[];
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

export type TUpdateQuery = {
  name: string;
  isTrash?: boolean;
  opts: Partial<TQueryOptions>;
};

export type TFindQueryParams = {
  dataSourceId?: string;
  teamId?: string;
  limit?: number;
  orderBy?: string;
  name?: string;
};

export type TQuery = {
  id: string;
  name: string;
  isTrash?: boolean;
  opts: Partial<TQueryOptions>;
  createdAt: Date;
  updatedAt: Date;
  dataSource?: {
    id: string;
  };
};
