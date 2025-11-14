import {useContext} from "react";
import {TableOptionsContext} from "../context/TableContext.ts";
import st from "./QueryInfoRow.module.css";
import {filterToString, filterValueToString} from "../../../utils/sql.ts";
import {showExplorerModal} from "../hooks/useExplorerModals.ts";

export const QueryInfoRow = () => {
  const { state: { joins, table, filters } } = useContext(TableOptionsContext);

  const onJoinClick = () => showExplorerModal("joins");
  const onFilterClick = () => showExplorerModal("filters");

  return (
    <div className={st.container}>
      <div className={st.greenPill} data-tooltip-id="default" data-tooltip-content={table}>
        <p className="text-sm">{table}</p>
      </div>

      {joins.map((j) => (
        <button onClick={onJoinClick} className={st.yellowPill} data-tooltip-id="default" data-tooltip-content={`Joins ${j.table} on ${j.on}`}>
          <p className="text-sm">{j.table}</p>
        </button>
      ))}

      {filters.map((f) => (
        <button onClick={onFilterClick} className={st.bluePill} data-tooltip-id="default" data-tooltip-content={filterToString(f)}>
          <p className="text-sm">{f.column}</p>
          <p className="text-sm">{f.operator}</p>
          <p className="text-sm">{filterValueToString(f)}</p>
        </button>
      ))}
    </div>
  );
};
