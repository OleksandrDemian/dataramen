import {TQueryOperator, TQueryValue} from "@dataramen/types";

export type TFilterParser = {
  operator: TQueryOperator;
  parse: (input: string) => ({ value: any })[] | undefined;
  stringify: (value: TQueryValue[], colType: string) => string;
};
