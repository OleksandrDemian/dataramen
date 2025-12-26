import {QueryFilter, TQueryOperator} from "@dataramen/sql-builder";

export type TFilterParser = {
  operator: TQueryOperator;
  parse: (input: string) => QueryFilter["value"] | undefined;
  stringify: (filter: QueryFilter, colType: string) => string;
};
