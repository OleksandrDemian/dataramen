import {TDbValue} from "@dataramen/types";
import {QueryFilter} from "@dataramen/sql-builder";

export function sanitizeCellValue (value: TDbValue, expectedType?: string): string {
  if (value === undefined || value === null) {
    return "";
  }

  // handle based on column type
  switch (expectedType) {
    case "json":
    case "jsonb":
      return JSON.stringify(value, null, 2);
  }

  if (value === 0 || value === false) {
    return value.toString();
  }

  // if no column handlers, handle on value type
  switch (typeof value) {
    case "string":
      return value;
    case "number":
    case "boolean":
        return value.toString();
    default:
      return JSON.stringify(value);
  }
}

export const filterToString = (filter: QueryFilter) => {
  const value = filter.value?.map((v) => v.value).join(", ") || '';
  return `${filter.column} ${filter.operator} ${value}`;
};

export const generateColumnLabel = (columnName: string): string => {
  // Replace underscores, hyphens with spaces
  let label = columnName.replace(/[_-]+/g, ' ');

  // Handle camelCase and PascalCase by inserting space before capital letters
  label = label.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

  // Convert everything to lowercase, then capitalize first letter of sentence
  label = label
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());

  return label;
};
