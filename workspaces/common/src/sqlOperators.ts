import {QueryFilter} from "@dataramen/sql-builder";

export type TOperator = {
  value: QueryFilter["operator"];
  label: string;
};

export const OPERATORS: TOperator[] = [
  { value: "=", label: "equals" },
  { value: "<>", label: "not equal" },
  { value: ">", label: "greater than" },
  { value: ">=", label: "greater than or equal" },
  { value: "<", label: "less than" },
  { value: "<=", label: "less than or equal" },
  { value: "LIKE", label: "contains" },
  { value: "NOT LIKE", label: "not contains" },
  { value: "IN", label: "in list" },
  { value: "NOT IN", label: "not in list" },
  { value: "IS NULL", label: "is null" },
  { value: "IS NOT NULL", label: "is not null" },
  // { value: "BETWEEN", label: "between" },
  // { value: "NOT BETWEEN", label: "not between" },
  // { value: "EXISTS", label: "exists" },
  // { value: "NOT EXISTS", label: "not exists" },
];

export const OPERATOR_LABEL: Record<QueryFilter["operator"], string> = OPERATORS.reduce((reducer, operator) => {
  reducer[operator.value] = operator.label;
  return reducer;
}, {} as Record<QueryFilter["operator"], string>);

export const OPERATOR_VALUE: Record<string, QueryFilter["operator"]> = OPERATORS.reduce((reducer, operator) => {
  reducer[operator.label] = operator.value;
  return reducer;
}, {} as Record<string, QueryFilter["operator"]>);

const generateOperators = (operators: QueryFilter["operator"][]): TOperator[] => {
  return operators.map((value) => {
    return {
      label: OPERATOR_LABEL[value],
      value,
    } satisfies TOperator;
  });
};

export const NUMBER_OPERATORS = generateOperators([
  "=",
  "<>",
  ">",
  ">=",
  "<",
  "<=",
  "IN",
  "NOT IN",
  // "BETWEEN",
  // "NOT BETWEEN",
  "IS NULL",
  "IS NOT NULL"
]);

export const STRING_OPERATORS = generateOperators([
  "=",
  "<>",
  "LIKE",
  "NOT LIKE",
  "IN",
  "NOT IN",
  "IS NULL",
  "IS NOT NULL"
]);

export const BOOLEAN_OPERATORS = generateOperators([
  "=",
  "<>",
  "IS NULL",
  "IS NOT NULL"
]);

export const DATE_OPERATORS = generateOperators([
  "=",
  "<>",
  ">",
  ">=",
  "<",
  "<=",
  // "BETWEEN",
  // "NOT BETWEEN",
  "IS NULL",
  "IS NOT NULL"
]);

export const NULLABLE_OPERATORS = generateOperators([
  "IS NULL",
  "IS NOT NULL"
]);

export const ARRAY_OPERATORS = generateOperators([
  "IN",
  "NOT IN"
]);

// export const EXISTS_OPERATORS = generateOperators([
//   "EXISTS",
//   "NOT EXISTS"
// ]);

export const allowsInput = (operator?: QueryFilter["operator"])=> {
  return operator !== "IS NULL" && operator !== "IS NOT NULL";
};

export const processInputVale = (operator: QueryFilter["operator"], value: string): QueryFilter["value"] => {
  if (!allowsInput(operator)) {
    return [];
  }

  if (operator === "IN" || operator === "NOT IN") {
    return value.split(",").map(v => ({
      value: v.trim(),
      isColumn: false,
    }));
  }

  return [{ value, isColumn: false }];
};

export const STRING_TYPES: string[] = [
  // MySQL
  "char", "varchar", "binary", "varbinary", "blob", "text", "enum", "set",
  // PostgreSQL
  "character", "character varying", "text", "citext", "uuid", "xml", "json", "jsonb",
];

const _STRING_TYPES_SET = new Set(STRING_TYPES);
export const isStringType = (type: string) => _STRING_TYPES_SET.has(type);

export const NUMERIC_TYPES: string[] = [
  // MySQL
  "integer", "smallint", "decimal", "numeric", "float", "real", "double precision", "int",
  // PostgreSQL
  "smallint", "integer", "bigint", "decimal", "numeric", "real", "double precision", "serial", "bigserial", "money",
];
const _NUMERIC_TYPES = new Set(NUMERIC_TYPES);
export const isNumericType = (type: string) => _NUMERIC_TYPES.has(type);

export const DATE_TYPES: string[] = [
  // MySQL
  "date", "time", "datetime", "timestamp", "year",
  // PostgreSQL
  "date", "time", "time without time zone", "time with time zone",
  "timestamp", "timestamp without time zone", "timestamp with time zone", "interval",
];

export const ALLOW_DATE_FUNCTIONS = ["date", "datetime", "timestamp", "timestamptz"].reduce(
  (acc, val) => {
    acc[val] = true;
    return acc;
  },
  {} as Record<string, boolean>
);
