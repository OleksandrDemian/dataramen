import clsx from "clsx";
import st from "./index.module.css";
import {useContext, useMemo, useState} from "react";
import {QueryResultContext, TableContext} from "../../context/TableContext.ts";
import {updateEntityEditor} from "../../../../data/entityEditorStore.ts";
import {gte} from "../../../../utils/numbers.ts";

const inputClass = clsx("input", st.filterInput);

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
      <input
        className={inputClass}
        placeholder="Filter"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div className={st.list}>
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
    </div>
  );
};
