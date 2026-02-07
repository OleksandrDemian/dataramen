import {useContext, useMemo, useState} from "react";
import {TableContext} from "../../context/TableContext.ts";
import {useCreateWorkbenchTab} from "../../../../data/queries/workbenchTabs.ts";
import {useNavigate} from "react-router-dom";
import {createTableOptions} from "../../utils.ts";
import {genSimpleId} from "../../../../utils/id.ts";
import {PAGES} from "../../../../const/pages.ts";
import st from "./index.module.css";
import {gt} from "../../../../utils/numbers.ts";
import {IHook, TDbValue} from "@dataramen/types";
import {SearchInput} from "../../../SearchInput";
import {HookButton} from "../../../HookButton";

function createRelatedDataTabData (hook: IHook, dataSourceId: string, value: TDbValue) {
  return {
    name: `${hook.fromTable} ${hook.fromColumn} equals ${value}`,
    opts: createTableOptions({
      // todo: do I need to inherit joins? Probably not
      table: hook.fromTable,
      dataSourceId: dataSourceId,
      filters: [{
        id: genSimpleId(),
        column: `${hook.fromTable}.${hook.fromColumn}`,
        value: value == null ? "IS NULL" : `${value}`,
        isEnabled: true,
      }],
    }),
  };
}

export type TDrillDownProps = {
  rowIndex: number;
  colIndex?: number;
  onClose?: VoidFunction;
  className?: string;
};
export const DrillDown = ({ rowIndex, colIndex, onClose, className }: TDrillDownProps) => {
  const [filter, setFilter] = useState("");
  const {
    dataSourceId,
    hooks,
    getColumnByIndex,
    getValue,
  } = useContext(TableContext);

  const availableHooks = useMemo<IHook[]>(() => {
    if (colIndex === undefined) {
      return hooks;
    }

    const header = getColumnByIndex(colIndex);
    if (header) {
      return hooks.filter((h) =>
        h.toColumn === header.column && h.toTable === header.table
      );
    }

    return [];
  }, [colIndex, hooks, getColumnByIndex]);

  const createWorkbenchTab = useCreateWorkbenchTab();
  const navigate = useNavigate();

  const filteredHooks = useMemo(() => {
    const lowercaseFilter = filter.toLowerCase();
    return availableHooks.filter(h => {
      // check if name matches
      return h.fromTable.toLowerCase().includes(lowercaseFilter);
    });
  }, [filter, availableHooks]);

  const showRelatedData = (hook: IHook) => {
    createWorkbenchTab.mutateAsync(
      createRelatedDataTabData(hook, dataSourceId, getValue(rowIndex, hook.toTable, hook.toColumn)),
    ).then((result) => {
      navigate(PAGES.workbenchTab.build({ id: result.id }));
      onClose?.();
    });
  };

  const hasFilteredHooks = gt(filteredHooks.length, 0);

  return (
    <div className={className}>
      <SearchInput
        autoFocus
        className={st.filterInput}
        placeholder="Filter"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div className={st.list}>
        {hasFilteredHooks && filteredHooks.map((hook) => (
          <HookButton key={hook.id} hook={hook} onClick={() => showRelatedData(hook)} />
        ))}

        {!hasFilteredHooks && (
          <p className={st.emptyText}>Empty</p>
        )}
      </div>
    </div>
  );
};
