import {QueryFilter, TQueryOperator} from "@dataramen/sql-builder";
import {TFilterParser} from "./types";
import {ContainsParser, LikeParser, NotContainsParser, NotLikeParser} from "./like";
import {InParser, NotInParser} from "./in";
import {
  EqParser,
  GteParser,
  GtParser,
  LteParser,
  LtParser,
  NotEqBParser,
  NotEqParser,
} from "./comparison";
import {NotNullParser, NullParser} from "./null";

const parsers: TFilterParser[] = [
  LikeParser,
  ContainsParser,
  NotLikeParser,
  NotContainsParser,
  InParser,
  NotInParser,
  EqParser,
  NotEqParser,
  NotEqBParser,
  GteParser,
  GtParser,
  LteParser,
  LtParser,
  NullParser,
  NotNullParser,
];

const parsersMap = parsers.reduce((acc, cur)=> {
  acc[cur.operator] = cur;
  return acc;
}, {} as Record<TQueryOperator, TFilterParser>);

function filterValueToString (filter: QueryFilter, type: string): string {
  return parsersMap[filter.operator]?.stringify(filter, type) || '';
}

function parseFilterValue (value: string): { operator?: TQueryOperator; value: QueryFilter["value"] } | undefined {
  const trimmed = value.trim();

  for (const parser of parsers) {
    const parsed = parser.parse(trimmed);
    if (parsed) {
      return {
        operator: parser.operator,
        value: parsed,
      };
    }
  }

  return undefined;
}

export const FilterParser = {
  parse: parseFilterValue,
  stringify: filterValueToString,
};
