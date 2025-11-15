import {useCallback, useContext} from "react";
import {QueryFilter} from "@dataramen/sql-builder";
import {TableOptionsContext} from "../context/TableContext.ts";
//
// function isSameValue (v1?: QueryFilter["value"], v2?: QueryFilter["value"]): boolean {
//   if (!v1 && !v2) return true;
//   if (!v1 || !v2) return false;
//
//   if (v1.length !== v2.length) {
//     return false;
//   }
//
//   for (let i = 0; i < v1.length; i++) {
//     if (v1[i] !== v2[i]) {
//       return false;
//     }
//   }
//
//   return true;
// }

export const useWhereStatements = () => {
  const { state, setState } = useContext(TableOptionsContext);

  const setFilters = useCallback((where: QueryFilter[], resetPage: boolean = false) => {
    setState((state) => ({
      ...state,
      page: resetPage ? 0 : state.page,
      filters: where,
    }));
  }, [setState]);

  const removeFilter = useCallback((id: string) => {
    setState((state) => {
      return {
        ...state,
        filters: state.filters.filter((f) => f.id !== id),
      };
    });
  }, [setState]);

  return {
    filters: state.filters,
    removeFilter,
    setFilters,
  };
};
