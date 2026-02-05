import st from "./index.module.css";
import {useContext, useMemo, useState} from "react";
import {TableContext} from "../../context/TableContext.ts";
import {updateEntityEditor} from "../../../../data/entityEditorStore.ts";
import {gt} from "../../../../utils/numbers.ts";
import {SearchInput} from "../../../SearchInput";
import { IHook } from "@dataramen/types";
import {HookButton} from "../../../HookButton";

export type TExpandRowProps = {
  onClose?: VoidFunction;
  rowIndex: number;
  className?: string;
};
export const ExpandRow = ({ onClose, rowIndex, className }: TExpandRowProps) => {
  const [filter, setFilter] = useState("");
  const {
    entities,
    dataSourceId,
    getValue,
  } = useContext(TableContext);

  const filteredEntities = useMemo<IHook[]>(() => {
    if (!filter) {
      return entities;
    }

    const lowerEnt = filter.toLowerCase();
    return entities.filter((ent) => ent.toTable.toLowerCase().includes(lowerEnt));
  }, [entities, filter]);

  const showEntity = (hook: IHook) => {
    const value = getValue(rowIndex, hook.fromTable, hook.fromColumn);
    updateEntityEditor({
      tableName: hook.toTable,
      dataSourceId,
      entityId: [[hook.toColumn, "" + value]],
    });
    onClose?.();
  };

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
        {gt(filteredEntities.length, 0) ? filteredEntities.map((hook) => (
          <HookButton key={hook.id} hook={hook} onClick={() => showEntity(hook)} />
        )) : (
          <p className={st.emptyText}>Empty</p>
        )}
      </div>
    </div>
  );
};
