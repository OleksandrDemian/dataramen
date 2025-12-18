import {ContextualMenu, TContextMenuRef} from "../../../ContextualMenu";
import {RefObject, useState} from "react";
import {useCellActions} from "./useCellActions.ts";
import SearchIcon from "../../../../assets/search-outline.svg?react";
import CopyIcon from "../../../../assets/copy-outline.svg?react";
import EyeIcon from "../../../../assets/eye-outline.svg?react";
import st from "./index.module.css";
import {DrillDown} from "../RowOptions/DrillDown.tsx";
import ChevronIcon from "../../../../assets/chevron-forward-outline.svg?react";
import ExpandIcon from "../../../../assets/chevron-expand-outline.svg?react";
import {ExpandRow} from "../RowOptions/ExpandRow.tsx";

export type TCellActionsProps = {
  ref: RefObject<TContextMenuRef | null>;
  row?: number;
  col?: number;
  onClosed?: VoidFunction;
};
export const CellActions = ({ ref, row, col, onClosed }: TCellActionsProps) => {
  const clickHandler = useCellActions({ ref });
  const [tab, setTab] = useState<"cell" | "drill" | "expand">("cell");

  const onCopyValue = () => clickHandler.copyValue(row!, col!);
  const onShowValue = () => clickHandler.showValue(row!, col!);
  const onFilterValue = () => clickHandler.filterValue(row!, col!);

  const onMenuClosed = () => {
    onClosed?.();
    setTab("cell");
  };

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
            <p className={st.sectionName}>Row actions</p>
            <button className={st.item} onClick={() => setTab("drill")}>
              <ChevronIcon width={14} height={14} />
              Drill down
            </button>
            <button className={st.item} onClick={() => setTab("expand")}>
              <ExpandIcon width={14} height={14} />
              Expand row
            </button>
          </>
        )}

        {tab === "drill" && (
          <>
            <button
              className="flex gap-1 items-center cursor-pointer px-2 py-1 text-sm rounded-lg bg-gray-50 hover:bg-gray-100 mb-2"
              onClick={() => setTab("cell")}
            >
              <ChevronIcon className="rotate-180" width={16} height={16} />
              Drill down
            </button>
            <DrillDown rowIndex={row!} onClose={() => ref.current?.close()} />
          </>
        )}

        {tab === "expand" && (
          <>
            <button
              className="flex gap-1 items-center cursor-pointer px-2 py-1 text-sm rounded-lg bg-gray-50 hover:bg-gray-100 mb-2"
              onClick={() => setTab("cell")}
            >
              <ChevronIcon className="rotate-180" width={16} height={16} />
              Expand row
            </button>
            <ExpandRow rowIndex={row!} onClose={() => ref.current?.close()} />
          </>
        )}
      </div>
    </ContextualMenu>
  )
};
