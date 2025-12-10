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
  const [filter, setFilter] = useState<string>('');
  const row = useMemo(() => result?.result.rows[rowIndex], [result, rowIndex]);
  const createWorkbenchTab = useCreateWorkbenchTab();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"hooks" | "entities">("hooks")

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
    if (!filter) {
      return entities;
    }

    return entities.filter((ent) => ent.includes(filter));
  }, [entities, filter]);

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

  const hasNestedData = state.groupBy.length > 0;

  return (
    <ContextualMenu handler={handler}>
      <div className={st.optionsContainer}>
        <div className="grid grid-cols-2 mb-2">
          <button className={clsx("p-2 cursor-pointer text-sm border-b", tab === "hooks" ? "border-white" : "border-r rounded-br-lg border-gray-200 bg-gray-50 text-gray-400")} onClick={() => setTab("hooks")}>
            Drill down
          </button>
          <button className={clsx("p-2 cursor-pointer text-sm border-b", tab === "entities" ? "border-white" : "border-l rounded-bl-lg border-gray-200 bg-gray-50 text-gray-400")} onClick={() => setTab("entities")}>
            Expand row
          </button>
        </div>

        <input
          className="input mx-2 text-sm"
          placeholder="Filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        {tab === "entities" && entities.length > 0 && (
          <div className={st.rowOptionsEntriesList}>
            {gte(filteredEntities.length, 0) ? filteredEntities.map((ent) => (
              <button
                key={ent}
                className={clsx(st.optionItem, "font-semibold text-sm")}
                onClick={() => showEntity(ent)}
              >
                <span>📄 {ent}</span>
              </button>
            )) : (
              <p className="text-center p-2 text-gray-800 text-sm">Empty</p>
            )}
          </div>
        )}

        {tab === "hooks" && hooks.length > 0 && (
          <div className={st.rowOptionsEntriesList}>
            {filteredHooks.length > 0 ? filteredHooks.map((hook) => (
              <HookButton
                hook={hook}
                onClick={() => showRelatedData(hook)}
                key={hook.where}
              />
            )) : (
              <p className="text-center p-2 text-gray-800 text-sm">Empty</p>
            )}
          </div>
        )}

        {hasNestedData && (
          <button onClick={showNestedData} className={st.underlyingRowsBtn}>🎯 Underlying rows</button>
        )}
      </div>
    </ContextualMenu>
  );
};
