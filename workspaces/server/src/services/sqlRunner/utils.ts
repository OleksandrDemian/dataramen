import {QueryFilter, TQueryOperator} from "@dataramen/sql-builder";
import {TQueryFilter} from "@dataramen/types";
import {FilterParser, isStringType} from "@dataramen/common";
import {HttpError} from "../../utils/httpError";

const getDefaultOperator = (type: string): TQueryOperator => {
  return isStringType(type) ? 'LIKE' : '=';
}

export const parseClientFilters = (filters: TQueryFilter[], columnTypes: Record<string, string>): QueryFilter[] => {
  const parsedFilters: QueryFilter[] = [];
  for (const f of filters) {
    if (!f.column?.length || !f.value?.length) continue;

    if (f.isAdvanced) {
      const parsed = FilterParser.parse(f.value);
      if (!parsed) {
        throw new HttpError(400, `Invalid value for '${f.column}': ${f.value}`);
      }

      parsedFilters.push({
        value: parsed.value,
        column: f.column,
        id: f.id,
        operator: parsed.operator || getDefaultOperator(columnTypes[f.column]),
        isEnabled: f.isEnabled,
        connector: "AND",
      });
    } else {
      parsedFilters.push({
        value: f.value ? [{ value: f.value }] : [],
        column: f.column,
        id: f.id,
        operator: getDefaultOperator(columnTypes[f.column]),
        isEnabled: f.isEnabled,
        connector: "AND",
      });
    }
  }

  return parsedFilters;
};
