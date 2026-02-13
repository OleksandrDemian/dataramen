import {ContextualMenu, TContextMenuRef} from "../../../ContextualMenu";
import {RefObject, useContext, useState} from "react";
import {useCellActions} from "./useCellActions.ts";
import SearchIcon from "../../../../assets/search-outline.svg?react";
import CopyIcon from "../../../../assets/copy-outline.svg?react";
import EyeIcon from "../../../../assets/eye-outline.svg?react";
import st from "./index.module.css";
import {DrillDown} from "../RowOptions/DrillDown.tsx";
import CaretUpIcon from "../../../../assets/caret-up-outline.svg?react";
import {TableContext} from "../../context/TableContext.ts";
import {gt} from "../../../../utils/numbers.ts";
import {ExpandRow} from "../RowOptions/ExpandRow.tsx";

export type TCellActionsProps = {
  ref: RefObject<TContextMenuRef | null>;
  row?: number;
  col?: number;
  onClosed?: VoidFunction;
};
export const CellActions = ({ ref, row, col, onClosed }: TCellActionsProps) => {
  const clickHandler = useCellActions({ ref });
  const [tab, setTab] = useState<"cell" | "drill" | "show-record">("cell");
  const {
    hooks,
    entities,
  } = useContext(TableContext);

  const onCopyValue = () => clickHandler.copyValue(row!, col!);
  const onShowValue = () => clickHandler.showValue(row!, col!);
  const onFilterValue = () => clickHandler.filterValue(row!, col!);

  const onExpand = () => {
    setTab("show-record");
  };

  const onMenuClosed = () => {
    onClosed?.();
    setTab("cell");
  };

  const hasDrill = gt(hooks?.length, 0);
  const hasRecords = gt(entities?.length, 0);

  return (
    <ContextualMenu ref={ref} onClosed={onMenuClosed}>
      <div className="w-full lg:w-sm">
        {tab === "cell" && (
          <>
            <p className={st.sectionName}>Cell actions</p>
            <button className={st.item} onClick={onCopyValue}>
              <CopyIcon width={14} height={14} />
              Copy
            </button>
            <button className={st.item} onClick={onShowValue}>
              <EyeIcon width={14} height={14} />
              View
            </button>
            <button className={st.item} onClick={onFilterValue}>
              <SearchIcon width={14} height={14} />
              Filter
            </button>

            {(hasRecords || hasDrill) && (
              <p className={st.sectionName}>Row actions</p>
            )}

            {hasRecords && (
              <button className={st.item} onClick={onExpand}>
                <CaretUpIcon className="text-green-600" width={14} height={14} />
                Show record
              </button>
            )}

            {hasDrill && (
              <button className={st.item} onClick={() => setTab("drill")}>
                <CaretUpIcon className="text-blue-600 rotate-180" width={14} height={14} />
                Drill down
              </button>
            )}
          </>
        )}

        {tab === "drill" && (
          <>
            <button
              className="flex gap-1 items-center cursor-pointer px-2 py-1 text-sm rounded-lg bg-gray-50 hover:bg-gray-100 mb-2"
              onClick={() => setTab("cell")}
            >
              <CaretUpIcon className="text-(--text-color-secondary) rotate-270" width={16} height={16} />
              Drill down
            </button>
            <DrillDown rowIndex={row!} onClose={() => ref.current?.close()} />
          </>
        )}

        {tab === "show-record" && (
          <>
            <button
              className="flex gap-1 items-center cursor-pointer px-2 py-1 text-sm rounded-lg bg-gray-50 hover:bg-gray-100 mb-2"
              onClick={() => setTab("cell")}
            >
              <CaretUpIcon className="text-(--text-color-secondary) rotate-270" width={16} height={16} />
              Show record
            </button>
            <ExpandRow rowIndex={row!} onClose={() => ref.current?.close()} />
          </>
        )}
      </div>
    </ContextualMenu>
  );
};
