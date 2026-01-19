import {TOrderByClause, TQueryOperator, TJoinClause, TQueryValue} from "@dataramen/types";

export interface IWhere {
  column: string;
  fn?: string;
  operator?: TQueryOperator;
  value: TQueryValue[];
}

export interface ISelectColumn {
  column: string;
  fn?: string;
  distinct?: boolean;
}

export interface ISelectQueryBuilder {
  setColumns (columns: ISelectColumn[]): void;
  addJoin (join: TJoinClause): void;
  addWhere (where: IWhere): void;
  addHaving (having: IWhere): void;
  setLimit (limit: number): void;
  setOffset (offset: number): void;
  addOrderBy (column: string, order: TOrderByClause["direction"]): void;
  addGroupBy (groupBy: ISelectColumn): void;

  hasAlias (alias: string): boolean;

  build (): { sql: string; params: any };
}

export interface IUpdateQueryBuilder {
  setParams (params: any): void;
  addWhere (where: IWhere): void;
  build (): { sql: string; params: any };
}

export interface IInsertQueryBuilder {
  setValues (params: any): void;
  build (): { sql: string; params: any };
}
