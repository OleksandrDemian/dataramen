import {useCallback, useContext} from "react";
import {TJoinClause} from "@dataramen/types";
import {TableOptionsContext} from "../context/TableContext.ts";

const differentJoin = (j1: TJoinClause, j2: TJoinClause) => {
  return (
    j1.type !== j2.type ||
    j1.on !== j2.on ||
    j1.table !== j2.table
  );
};

const sameJoin = (j1: TJoinClause, j2: TJoinClause) => {
  return (
    j1.type === j2.type &&
    j1.on === j2.on &&
    j1.table === j2.table
  );
};

export const useJoinStatements = () => {
  const { state, setState } = useContext(TableOptionsContext);

  const toggle = useCallback((join: TJoinClause) => {
    setState((state) => {
      const joins = state.joins;
      const exists = joins.some((j) => sameJoin(j, join));
      if (exists) {
        const removePattern = join.table + ".";

        return {
          ...state,
          joins: joins.filter((j) => differentJoin(j, join)),
          columns: state.columns.filter((c) => !c.value.startsWith(removePattern)),
          groupBy: state.groupBy.filter((g) => !g.value.startsWith(removePattern)),
          orderBy: state.orderBy.filter((o) => !o.column.startsWith(removePattern)),
          aggregations: state.aggregations.filter((a) => !a.value.startsWith(removePattern)),
          filters: state.filters.filter((f) => !f.column.startsWith(removePattern)),
        };
      }

      return {
        ...state,
        joins: [...joins, join],
      };
    });
  }, [setState]);

  return {
    joins: state.joins,
    toggle,
  };
};
