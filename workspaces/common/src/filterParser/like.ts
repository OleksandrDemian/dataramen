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
  stringify: (values) => `LIKE "%${values[0]?.value}%"`,
};

export const NotLikeParser: TFilterParser = {
  operator: "NOT LIKE",
  parse: (value) => {
    const match = value.match(/^NOT LIKE\s*["'](.*)["']$/i);
    if (match) return [{ value: removeQuotes(match[1]) }];
  },
  stringify: (values) => `NOT LIKE "%${values[0]?.value}%"`,
};

export const ContainsParser: TFilterParser = {
  operator: "CONTAINS",
  parse: (value) => {
    const match = value.match(/^CONTAINS\s*["'](.*)["']$/i);
    if (match) {
      return [{ value: removeQuotes(match[1]) }];
    }
  },
  stringify: (values, type) =>
    isStringType(type) ? `${values[0]?.value}` : `CONTAINS "%${values[0]?.value}%"`,
};

export const NotContainsParser: TFilterParser = {
  operator: "NOT CONTAINS",
  parse: (value) => {
    const match = value.match(/^NOT CONTAINS\s*["'](.*)["']$/i);
    if (match) return [{ value: removeQuotes(match[1]) }];
  },
  stringify: (values) => `NOT CONTAINS "%${values[0]?.value}%"`,
};
