import {TFilterParser} from "./types";
import {isNumericType} from "../sqlOperators";
import {removeQuotes} from "./utils";

export const EqParser: TFilterParser = {
  operator: "=",
  parse: (value) => {
    const match = value.match(/^=\s*(.*)$/);
    if (match) {
      return [{ value: removeQuotes(match[1]) }];
    }
  },
  stringify: (filter, type) => isNumericType(type) ? `${filter.value?.[0].value}` : `= ${filter.value?.[0].value}`,
};

export const NotEqParser: TFilterParser = {
  operator: "!=",
  parse: (value) => {
    const match = value.match(/^!=\s*(.*)$/);
    if (match) {
      return [{ value: removeQuotes(match[1]) }];
    }
  },
  stringify: (filter) => `!= ${filter.value?.[0].value}`,
};

export const NotEqBParser: TFilterParser = {
  operator: "<>",
  parse: (value) => {
    const match = value.match(/^<>\s*(.*)$/);
    if (match) {
      return [{ value: removeQuotes(match[1]) }];
    }
  },
  stringify: (filter) => `<> ${filter.value?.[0].value}`,
};

export const GtParser: TFilterParser = {
  operator: ">",
  parse: (value) => {
    const match = value.match(/^>\s*(.*)$/);
    if (match) {
      return [{ value: removeQuotes(match[1]) }];
    }
  },
  stringify: (filter) => `> ${filter.value?.[0].value}`,
};

export const GteParser: TFilterParser = {
  operator: ">=",
  parse: (value) => {
    const match = value.match(/^>=\s*(.*)$/);
    if (match) {
      return [{ value: removeQuotes(match[1]) }];
    }
  },
  stringify: (filter) => `>= ${filter.value?.[0].value}`,
};

export const LtParser: TFilterParser = {
  operator: "<",
  parse: (value) => {
    const match = value.match(/^<\s*(.*)$/);
    if (match) {
      return [{ value: removeQuotes(match[1]) }];
    }
  },
  stringify: (filter) => `< ${filter.value?.[0].value}`,
};

export const LteParser: TFilterParser = {
  operator: "<=",
  parse: (value) => {
    const match = value.match(/^<=\s*(.*)$/);
    if (match) {
      return [{ value: removeQuotes(match[1]) }];
    }
  },
  stringify: (filter) => `<= ${filter.value?.[0].value}`,
};
