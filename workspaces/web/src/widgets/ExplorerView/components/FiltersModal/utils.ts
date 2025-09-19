import {QueryFilter} from "@dataramen/sql-builder";
import {OPERATOR_VALUE, processInputVale} from "@dataramen/common";
import toast from "react-hot-toast";
import {TFilterForm} from "./types.ts";

export const allowsColumnRef: QueryFilter["operator"][] = ["=", "<", ">", ">=", "<>", "!=", "<="];
export function validateFilters (filters: TFilterForm[]): boolean {
  for (let i = 0; i < filters.length; i++){
    const f = filters[i];

    if (!f.operator.length && !f.value.length && !f.column.length) {
      continue;
    }

    if (!f.column.includes(".")) {
      toast.error(`Filter #${i+1} has invalid column value`);
      return false;
    }

    const OP = OPERATOR_VALUE[f.operator];
    if (!OP) {
      toast.error(`Filter #${i+1} has invalid operator`);
      return false;
    }

    if (f.isColumnRef && !allowsColumnRef.includes(OP)) {
      toast.error(`Filter #${i+1} cannot reference another column because it uses '${f.operator}' operator`);
      return false;
    }
  }

  return true;
}

export function mapFiltersToWhere (filters: TFilterForm[]): QueryFilter[] {
  const newFilters: QueryFilter[] = [];

  filters.forEach((f) => {
    if (!f.operator.length || !f.value.length || !f.column.length) {
      return;
    }

    const operator = OPERATOR_VALUE[f.operator];
    newFilters.push({
      id: f.id,
      value: f.isColumnRef ? [{ value: f.value, isColumn: true }] : processInputVale(operator, f.value),
      operator,
      column: f.column,
      isEnabled: true,
      connector: "AND",
    });
  });

  return newFilters;
}

export function filterValueToString (filter: QueryFilter): string {
  let str = "";
  if (filter.value) {
    for (let i = 0; i < filter.value.length; i++){
      str += filter.value[i].value;
      if (i < filter.value.length - 1){
        str += ", ";
      }
    }
  }

  return str;
}