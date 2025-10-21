import {useCallback, useContext} from "react";
import {QueryFilter} from "@dataramen/sql-builder";
import {TableOptionsContext} from "../context/TableContext.ts";

function isSameValue (v1?: QueryFilter["value"], v2?: QueryFilter["value"]): boolean {
  if (!v1 && !v2) return true;
  if (!v1 || !v2) return false;

  if (v1.length !== v2.length) {
    return false;
  }

  for (let i = 0; i < v1.length; i++) {
    if (v1[i] !== v2[i]) {
      return false;
    }
  }

  return true;
}

export const useWhereStatements = () => {
  const { state, setState } = useContext(TableOptionsContext);

  const setFilters = useCallback((where: QueryFilter[]) => {
    setState((state) => ({
      ...state,
      opts: {
        ...state.opts,
        filters: where,
      }
    }));
  }, [setState]);

  const removeFilter = useCallback((filter: QueryFilter) => {
    setState((state) => {
      return {
        ...state,
        opts: {
          ...state.opts,
          filters: state.opts.filters.filter((f) => {
            return !(filter.column === f.column && filter.operator === f.operator && isSameValue(filter.value, f.value));
          }),
        }
      };
    });
  }, [setState]);

  return {
    filters: state.opts.filters,
    removeFilter,
    setFilters,
  };
};
