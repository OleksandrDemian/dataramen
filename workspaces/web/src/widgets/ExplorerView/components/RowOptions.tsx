import {TContextMenuHandler} from "./ContextualMenu.handler.ts";
import {useContext, useMemo, useState} from "react";
import {QueryResultContext, TableContext, TableOptionsContext} from "../context/TableContext.ts";
import {QueryFilter} from "@dataramen/sql-builder";
import {THook} from "../../../data/types/hooks.ts";
import {updateEntityEditor} from "../../../data/entityEditorStore.ts";
import {ContextualMenu} from "./ContextualMenu.tsx";
import st from "./QueryExplorer.module.css";
import clsx from "clsx";
import {HookButton} from "../../HookButton";
import {gte} from "../../../utils/numbers.ts";
import {genSimpleId} from "../../../utils/id.ts";
import {useCreateWorkbenchTab} from "../../../data/queries/workbenchTabs.ts";
import {createTableOptions} from "../utils.ts";
import {useNavigate} from "react-router-dom";
import {PAGES} from "../../../const/pages.ts";

export type TRowOptionsProps = {
  handler: TContextMenuHandler;
  rowIndex: number;
};
export const RowOptions = ({ handler, rowIndex }: TRowOptionsProps) => {
  const {
    hooks,
    entities,
    dataSourceId,
    getEntityKey,
    getValue,
  } = useContext(TableContext);
  const { state } = useContext(TableOptionsContext);
  const { data: result } = useContext(QueryResultContext);
  const [entityFilter, setEntityFilter] = useState<string>('');
  const [hooksFilter, setHooksFilter] = useState<string>('');
  const row = useMemo(() => result?.result.rows[rowIndex], [result, rowIndex]);
  const createWorkbenchTab = useCreateWorkbenchTab();
  const navigate = useNavigate();

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
            connector: "AND",
            column: g.value,
            operator: "=",
            value: [{
              value: getValue(row, g),
            }],
          } satisfies QueryFilter))
        ]
      }),
    }).then((result) => {
      navigate(`${PAGES.workbench.path}/tab/${result.id}`);
      handler.close();
    });
  };

  const showRelatedData = (hook: THook) => {
    if (!row) {
      return;
    }

    const value = getValue(row, {
      value: `${hook.on.fromTable}.${hook.on.fromColumn}`,
    });

    createWorkbenchTab.mutateAsync({
      name: `${hook.on.toTable} ${hook.on.toColumn} equals ${value}`,
      opts: createTableOptions({
        // todo: do I need to inherit joins? Probably not
        table: hook.on.toTable,
        dataSourceId: dataSourceId,
        filters: [{
          id: genSimpleId(),
          column: `${hook.on.toTable}.${hook.on.toColumn}`,
          operator: value == null ? "IS NULL" : "=",
          connector: "AND",
          value: value != null ? [{
            value: value,
            isColumn: false,
          }] : undefined,
        }],
      }),
    }).then((result) => {
      navigate(`${PAGES.workbench.path}/tab/${result.id}`);
      handler.close();
    });
  };

  const showEntity = (ent: string) => {
    if (!row) {
      return;
    }

    const key = getEntityKey(ent, row);
    handler.close();
    updateEntityEditor({
      tableName: ent,
      dataSourceId,
      entityId: key,
    });
    handler.close();
  };

  const filteredEntities = useMemo<string[]>(() => {
    if (!entityFilter) {
      return entities;
    }

    return entities.filter((ent) => ent.includes(entityFilter));
  }, [entities, entityFilter]);

  const filteredHooks = useMemo(() => {
    if (!result) return [];

    const lowercaseFilter = hooksFilter.toLowerCase();
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
  }, [hooksFilter, hooks, result]);

  const hasNestedData = state.groupBy.length > 0;

  return (
    <ContextualMenu handler={handler}>
      {entities.length > 0 && (
        <div className={st.optionsContainer}>
          <label className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-b-gray-200 p-2">
            <span className="font-semibold">📝 Edit row</span>
            <input
              className="input"
              placeholder="Filter entities"
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
            />
          </label>

          <div className="flex flex-col overflow-y-auto">
            {gte(filteredEntities.length, 0) ? filteredEntities.map((ent) => (
              <button
                key={ent}
                className={clsx(st.optionItem, "font-semibold")}
                onClick={() => showEntity(ent)}
              >
                <span>📄 {ent}</span>
              </button>
            )) : (
              <p className="text-center p-2 text-gray-800">Empty</p>
            )}
          </div>
        </div>
      )}

      {hooks.length > 0 && (
        <div className={st.optionsContainer}>
          <label className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-b-gray-200 p-2">
            <span className="font-semibold">↗️ Connected tables</span>
            <input
              className="input"
              placeholder="Filter tables"
              value={hooksFilter}
              onChange={(e) => setHooksFilter(e.target.value)}
            />
          </label>

          <div className="flex flex-col overflow-y-auto">
            {filteredHooks.length > 0 ? filteredHooks.map((hook) => (
              <HookButton
                hook={hook}
                onClick={() => showRelatedData(hook)}
                key={hook.where}
              />
            )) : (
              <p className="text-center p-2 text-gray-800">Empty</p>
            )}
          </div>
        </div>
      )}

      {hasNestedData && (
        <button onClick={showNestedData} className={st.underlyingRowsBtn}>🎯 Underlying rows</button>
      )}
    </ContextualMenu>
  );
};
