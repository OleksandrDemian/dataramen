import {useContext, useMemo, useState} from "react";
import {QueryResultContext, TableContext} from "../../context/TableContext.ts";
import {useCreateWorkbenchTab} from "../../../../data/queries/workbenchTabs.ts";
import {useNavigate} from "react-router-dom";
import {createTableOptions} from "../../utils.ts";
import {genSimpleId} from "../../../../utils/id.ts";
import {PAGES} from "../../../../const/pages.ts";
import st from "./index.module.css";
import {gt} from "../../../../utils/numbers.ts";
import {IInspectionColumnRef, TDbValue, TResultColumn} from "@dataramen/types";
import {SearchInput} from "../../../SearchInput";

function createRelatedDataTabData (ref: IInspectionColumnRef, dataSourceId: string, value: TDbValue) {
  return {
    name: `${ref.table} ${ref.field} equals ${value}`,
    opts: createTableOptions({
      // todo: do I need to inherit joins? Probably not
      table: ref.table,
      dataSourceId: dataSourceId,
      filters: [{
        id: genSimpleId(),
        column: `${ref.table}.${ref.field}`,
        value: value == null ? "IS NULL" : `${value}`,
        isEnabled: true,
      }],
    }),
  };
}

export type TDrillDownProps = {
  rowIndex: number;
  colIndex: number;
  onClose?: VoidFunction;
  className?: string;
};
export const DrillDown = ({ rowIndex, colIndex, onClose, className }: TDrillDownProps) => {
  const [filter, setFilter] = useState("");
  const {
    dataSourceId,
    getValue,
  } = useContext(TableContext);
  const { data: result } = useContext(QueryResultContext);

  const header = useMemo(() => {
    return result?.result?.columns[colIndex];
  }, [colIndex, result]);

  const row = useMemo(() => result?.result.rows[rowIndex], [result, rowIndex]);
  const createWorkbenchTab = useCreateWorkbenchTab();
  const navigate = useNavigate();

  const filteredHooks = useMemo(() => {
    if (!header || !header.referencedBy) return [];

    const lowercaseFilter = filter.toLowerCase();
    return header.referencedBy.filter(h => {
      // check if name matches
      return h.table.toLowerCase().includes(lowercaseFilter);
    });
  }, [filter, header]);

  const showRelatedData = (col: TResultColumn, ref: IInspectionColumnRef) => {
    if (!row) {
      return;
    }

    createWorkbenchTab.mutateAsync(
      createRelatedDataTabData(
        ref,
        dataSourceId,
        getValue(row, {
          value: col.alias,
        }),
      ),
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
        {hasFilteredHooks && filteredHooks.map((ref) => (
          <div onClick={() => showRelatedData(header!, ref)} className="p-1 hover:bg-(--bg-sec) rounded-md cursor-pointer" tabIndex={0}>
            <p className="text-sm text-(--text-color-primary) font-semibold">{ref.table}</p>
            <p className="text-xs text-(--text-color-secondary)">{header?.full} = {ref.field}</p>
          </div>
        ))}

        {!hasFilteredHooks && (
          <p className={st.emptyText}>Empty</p>
        )}
      </div>
    </div>
  );
};
