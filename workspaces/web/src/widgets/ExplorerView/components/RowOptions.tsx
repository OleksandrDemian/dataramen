import {TContextMenuHandler} from "./ContextualMenu.handler.ts";
import {useContext, useMemo, useState} from "react";
import {QueryResultContext, TableContext, TableOptionsContext} from "../context/TableContext.ts";
import {openQueryModal} from "../../../data/queryModalStore.ts";
import {QueryFilter} from "@dataramen/sql-builder";
import {THook} from "../../../data/types/hooks.ts";
import {updateEntityEditor} from "../../../data/entityEditorStore.ts";
import {ContextualMenu} from "./ContextualMenu.tsx";
import st from "./QueryExplorer.module.css";
import clsx from "clsx";
import {HookButton} from "../../HookButton";
import {gte} from "../../../utils/numbers.ts";

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
  const row = useMemo(() => result?.rows[rowIndex], [result, rowIndex]);

  const showNestedData = () => {
    if (!row) {
      return;
    }

    openQueryModal("⬇️ " + state.table, {
      joins: state.joins,
      table: state.table,
      dataSourceId: state.dataSourceId,
      filters: [
        ...state.filters,
        ...state.groupBy.map((g) => ({
          connector: "AND",
          column: g.value,
          operator: "=",
          value: [{
            value: getValue(row, g),
          }],
        } satisfies QueryFilter))
      ]
    });
    handler.close();
  };

  const showRelatedData = (hook: THook) => {
    if (!row) {
      return;
    }

    const value = getValue(row, {
      value: `${hook.on.fromTable}.${hook.on.fromColumn}`,
    });

    openQueryModal(`${hook.on.toColumn} equals ${value}`, {
      table: hook.on.toTable,
      dataSourceId,
      filters: [{
        column: hook.on.toTable + "." + hook.on.toColumn,
        operator: value == null ? "IS NULL" : "=",
        connector: "AND",
        value: value != null ? [{
          value: value,
          isColumn: false,
        }] : undefined,
      }],
    });
    handler.close();
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
      const hasColumn = result.columns.some((c) => {
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
          <label className="flex justify-between items-center gap-2 sticky left-0 top-0 input">
            <span className="font-semibold">📝</span>
            <input
              className="flex-1 outline-0"
              placeholder="Edit/View row"
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
            />
          </label>

          <div className="flex flex-col">
            {gte(filteredEntities.length, 0) ? filteredEntities.map((ent) => (
              <button
                key={ent}
                className={clsx(st.optionItem, "font-semibold")}
                onClick={() => showEntity(ent)}
              >
                <span>📄 {ent}</span>
              </button>
            )) : (
              <p className="text-center text-gray-800">Empty</p>
            )}
          </div>
        </div>
      )}

      {hooks.length > 0 && (
        <div className={st.optionsContainer}>
          <label className="flex justify-between items-center gap-2 sticky left-0 top-0 p-1 input">
            <span className="font-semibold">↗️</span>
            <input
              className="flex-1 outline-0"
              placeholder="Connected tables"
              value={hooksFilter}
              onChange={(e) => setHooksFilter(e.target.value)}
            />
          </label>

          <div className="flex flex-col">
            {filteredHooks.length > 0 ? filteredHooks.map((hook) => (
              <HookButton
                hook={hook}
                onClick={() => showRelatedData(hook)}
                key={hook.where}
              />
            )) : (
              <p className="text-center text-gray-800">Empty</p>
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
