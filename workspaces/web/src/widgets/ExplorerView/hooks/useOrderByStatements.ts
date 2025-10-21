import {useCallback, useContext} from "react";
import {OrderByClause} from "@dataramen/sql-builder";
import {TableOptionsContext} from "../context/TableContext.ts";

const getNextDirection = (direction: OrderByClause["direction"]): OrderByClause["direction"] | undefined => {
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
      const cur = state.opts.orderBy[0];
      if (cur && cur.column === column) {
        const direction = getNextDirection(cur.direction);
        if (!direction) {
          return {
            ...state,
            opts: {
              ...state.opts,
              orderBy: [],
            },
          };
        }

        return {
          ...state,
          opts: {
            ...state.opts,
            orderBy: [{ column, direction }],
          },
        };
      }

      return {
        ...state,
        opts: {
          ...state.opts,
          orderBy: [{ column, direction: "ASC" }],
        },
      };
    });
  }, [setState]);

  return {
    orderBy: state.opts.orderBy,
    updateOrderBy,
  };
};
