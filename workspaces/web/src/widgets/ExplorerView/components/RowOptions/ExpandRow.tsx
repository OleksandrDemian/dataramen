import st from "./index.module.css";
import {useContext, useMemo, useState} from "react";
import {QueryResultContext, TableContext} from "../../context/TableContext.ts";
import {updateEntityEditor} from "../../../../data/entityEditorStore.ts";
import {gt} from "../../../../utils/numbers.ts";
import {SearchInput} from "../../../SearchInput";

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
    getEntityKey,
  } = useContext(TableContext);
  const { data: result } = useContext(QueryResultContext);
  const row = useMemo(() => result?.result.rows[rowIndex], [result, rowIndex]);

  const filteredEntities = useMemo<string[]>(() => {
    if (!filter) {
      return entities;
    }

    return entities.filter((ent) => ent.includes(filter));
  }, [entities, filter]);

  const showEntity = (ent: string) => {
    if (!row) {
      return;
    }

    const key = getEntityKey(ent, row);
    updateEntityEditor({
      tableName: ent,
      dataSourceId,
      entityId: key,
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
        {gt(filteredEntities.length, 0) ? filteredEntities.map((ent) => (
          <button
            key={ent}
            className={st.optionItem}
            onClick={() => showEntity(ent)}
          >
            <span>📄 {ent}</span>
          </button>
        )) : (
          <p className={st.emptyText}>Empty</p>
        )}
      </div>
    </div>
  );
};
