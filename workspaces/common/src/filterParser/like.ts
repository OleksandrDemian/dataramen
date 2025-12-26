import {TFilterParser} from "./types";
import {removeQuotes} from "./utils";
import {isStringType} from "../sqlOperators";

export const LikeParser: TFilterParser = {
  operator: "LIKE",
  parse: (value) => {
    const match = value.match(/^LIKE\s*["'](.*)["']$/i);
    if (match) {
      return [{ value: removeQuotes(match[1]) }];
    }
  },
  stringify: (filter, type) => isStringType(type) ? `${filter.value?.[0].value}` : `LIKE "%${filter.value?.[0].value}%"`,
};

export const NotLikeParser: TFilterParser = {
  operator: "NOT LIKE",
  parse: (value) => {
    const match = value.match(/^NOT LIKE\s*["'](.*)["']$/i);
    if (match) return [{ value: removeQuotes(match[1]) }];
  },
  stringify: (filter) => `NOT LIKE "%${filter.value?.[0].value}%"`,
};
