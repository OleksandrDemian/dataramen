import {TInputColumn} from "@dataramen/types";

export const inputColumnToAlias = (column: TInputColumn) => {
  if (column.fn) {
    if (column.distinct === true) {
      return `${column.fn} distinct ${column.value}`;
    }

    return `${column.fn} ${column.value}`;
  }

  return column.value;
};
