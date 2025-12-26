import {useCallback, useContext} from "react";
import {TableOptionsContext} from "../context/TableContext.ts";
import {TQueryFilter} from "@dataramen/types";

export const useWhereStatements = () => {
  const { state, setState } = useContext(TableOptionsContext);

  const setFilters = useCallback((where: TQueryFilter[], resetPage: boolean = false) => {
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
