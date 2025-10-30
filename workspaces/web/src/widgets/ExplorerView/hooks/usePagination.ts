import {useCallback, useContext} from "react";
import {TableOptionsContext} from "../context/TableContext.ts";

export const usePagination = () => {
  const { state, setState } = useContext(TableOptionsContext);

  const setPage = useCallback((page: number) => {
    setState((prevState) => ({
      ...prevState,
      page,
    }));
  }, [setState]);

  const setSize = useCallback((size: number, resetPage: boolean = false) => {
    setState((prevState) => ({
      ...prevState,
      size,
      page: resetPage ? 0 : prevState.page,
    }));
  }, [setState]);

  return {
    page: state.page,
    size: state.size,
    setSize,
    setPage,
  };
};
