import {useContext, useMemo, useState} from "react";
import {QueryResultContext, TableContext, TableOptionsContext} from "../../context/TableContext.ts";
import {useCreateWorkbenchTab} from "../../../../data/queries/workbenchTabs.ts";
import {useNavigate} from "react-router-dom";
import {THook} from "../../../../data/types/hooks.ts";
import {createTableOptions} from "../../utils.ts";
import {genSimpleId} from "../../../../utils/id.ts";
import {PAGES} from "../../../../const/pages.ts";
import st from "./index.module.css";
import {gte} from "../../../../utils/numbers.ts";
import {HookButton} from "../../../HookButton";
import clsx from "clsx";
import {TDbValue, TQueryFilter} from "@dataramen/types";

const inputClass = clsx("input", st.filterInput);

function createRelatedDataTabData (hook: THook, dataSourceId: string, value: TDbValue) {
  return {
    name: `${hook.on.toTable} ${hook.on.toColumn} equals ${value}`,
    opts: createTableOptions({
      // todo: do I need to inherit joins? Probably not
      table: hook.on.toTable,
      dataSourceId: dataSourceId,
      filters: [{
        id: genSimpleId(),
        column: `${hook.on.toTable}.${hook.on.toColumn}`,
        value: value == null ? "IS NULL" : `${value}`,
      }],
    }),
  };
}

export type TDrillDownProps = {
  rowIndex: number;
  onClose?: VoidFunction;
  className?: string;
};
export const DrillDown = ({ rowIndex, onClose, className }: TDrillDownProps) => {
  const [filter, setFilter] = useState("");
  const {
    hooks,
    dataSourceId,
    getValue,
  } = useContext(TableContext);
  const { state } = useContext(TableOptionsContext);
  const { data: result } = useContext(QueryResultContext);
  const row = useMemo(() => result?.result.rows[rowIndex], [result, rowIndex]);
  const createWorkbenchTab = useCreateWorkbenchTab();
  const navigate = useNavigate();

  const filteredHooks = useMemo(() => {
    if (!result) return [];

    const lowercaseFilter = filter.toLowerCase();
    return hooks.filter(h => {
      // check if available for hooking
      const hasColumn = result.result.columns.some((c) => {
        return c.column === h.on.fromColumn && c.table === h.on.fromTable;
      });

      if (!hasColumn) {
        return false;
      }

      // check if name matches
      return h.on.toTable.toLowerCase().includes(lowercaseFilter);
    });
  }, [filter, hooks, result]);

  const showRelatedData = (hook: THook) => {
    if (!row) {
      return;
    }

    createWorkbenchTab.mutateAsync(
      createRelatedDataTabData(
        hook,
        dataSourceId,
        getValue(row, {
          value: `${hook.on.fromTable}.${hook.on.fromColumn}`,
        }),
      ),
    ).then((result) => {
      navigate(`${PAGES.workbench.path}/tab/${result.id}`);
      onClose?.();
    });
  };

  const showNestedData = () => {
    if (!row) {
      return;
    }

    createWorkbenchTab.mutateAsync({
      name: `${state.table} > [${state.joins.map(j => j.table).join()}]`,
      opts: createTableOptions({
        joins: state.joins,
        table: state.table,
        dataSourceId: state.dataSourceId,
        filters: [
          ...state.filters,
          ...state.groupBy.map((g) => ({
            id: genSimpleId(),
            column: g.value,
            value: `${getValue(row, g)}`,
          } satisfies TQueryFilter))
        ]
      }),
    }).then((result) => {
      navigate(`${PAGES.workbench.path}/tab/${result.id}`);
      onClose?.();
    });
  };

  const hasNestedData = state.groupBy.length > 0;

  return (
    <div className={className}>
      <input
        className={inputClass}
        placeholder="Filter"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div className={st.list}>
        {hasNestedData && (
          <button onClick={showNestedData} className={st.optionItem}>🎯 Underlying rows</button>
        )}

        {gte(filteredHooks.length, 0) ? filteredHooks.map((hook) => (
          <HookButton
            hook={hook}
            onClick={() => showRelatedData(hook)}
            key={hook.where}
          />
        )) : (
          <p className={st.emptyText}>Empty</p>
        )}
      </div>
    </div>
  );
};
