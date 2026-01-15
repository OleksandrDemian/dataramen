import {JoinClause, OrderByClause, QueryFilter} from "@dataramen/sql-builder";
import {TInputColumn} from "@dataramen/types";

export interface ISelectQueryBuilder {
  setColumns (columns: string[]): void;
  addColumn (column: string, alias: string): void;
  addJoin (join: JoinClause): void;
  addWhere (where: QueryFilter): void;
  addHaving (having: QueryFilter): void;
  setLimit (limit: number): void;
  setOffset (offset: number): void;
  addOrderBy (column: string, order: OrderByClause["direction"]): void;
  addGroupBy (groupBy: TInputColumn): void;

  build (): { sql: string; params: any };
}

export interface IUpdateQueryBuilder {
  setParams (params: any): void;
  addWhere (where: QueryFilter): void;
  build (): { sql: string; params: any };
}
