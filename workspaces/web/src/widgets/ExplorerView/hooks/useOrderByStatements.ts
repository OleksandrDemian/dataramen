import {useCallback, useContext} from "react";
import {TOrderByClause} from "@dataramen/types";
import {TableOptionsContext} from "../context/TableContext.ts";

const getNextDirection = (direction: TOrderByClause["direction"]): TOrderByClause["direction"] | undefined => {
  if (direction === "ASC") {
    return "DESC";
  }

  if (direction === "DESC") {
    return undefined;
  }

  return "ASC";
};

export const useOrderByStatements = () => {
  const {state, setState} = useContext(TableOptionsContext);

  const updateOrderBy = useCallback((column: string) => {
    setState((state) => {
      const cur = state.orderBy[0];
      if (cur && cur.column === column) {
        const direction = getNextDirection(cur.direction);
        if (!direction) {
          return {
            ...state,
            orderBy: [],
          };
        }

        return {
          ...state,
          orderBy: [{ column, direction }],
        };
      }

      return {
        ...state,
        orderBy: [{ column, direction: "ASC" }],
      };
    });
  }, [setState]);

  return {
    orderBy: state.orderBy,
    updateOrderBy,
  };
};
