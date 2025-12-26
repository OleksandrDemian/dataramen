import {TFilterParser} from "./types";

export const NullParser: TFilterParser = {
  operator: "IS NULL",
  parse: (value) => {
    if (/^is\s+null$/i.test(value)) return [];
  },
  stringify: () => `IS NULL`,
};

export const NotNullParser: TFilterParser = {
  operator: "IS NOT NULL",
  parse: (value) => {
    if (/^is\s+not\s+null$/i.test(value)) return [];
  },
  stringify: () => `IS NOT NULL`,
};