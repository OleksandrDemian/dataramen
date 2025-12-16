import {useState} from "react";
import st from "./index.module.css";
import clsx from "clsx";
import {TContextMenuHandler} from "../ContextualMenu.handler.ts";
import {ContextualMenu} from "../ContextualMenu.tsx";
import {DrillDown} from "./DrillDown.tsx";
import {ExpandRow} from "./ExpandRow.tsx";

export type TRowOptionsProps = {
  handler: TContextMenuHandler;
  rowIndex: number;
};
export const RowOptions = ({ handler, rowIndex }: TRowOptionsProps) => {
  const [tab, setTab] = useState<"hooks" | "entities">("hooks")

  return (
    <ContextualMenu handler={handler}>
      <div className={st.optionsContainer}>
        <div className="grid grid-cols-2">
          <button className={clsx("p-2 cursor-pointer text-sm border-b font-semibold", tab === "hooks" ? "border-white" : "border-r rounded-br-lg border-gray-200 bg-gray-50 text-gray-400")} onClick={() => setTab("hooks")}>
            Drill down
          </button>
          <button className={clsx("p-2 cursor-pointer text-sm border-b font-semibold", tab === "entities" ? "border-white" : "border-l rounded-bl-lg border-gray-200 bg-gray-50 text-gray-400")} onClick={() => setTab("entities")}>
            Expand row
          </button>
        </div>

        {tab === "entities" && (
          <ExpandRow
            rowIndex={rowIndex}
            className="p-2"
            onClose={() => {
              handler.close();
            }}
          />
        )}

        {tab === "hooks" && (
          <DrillDown
            rowIndex={rowIndex}
            className="p-2"
            onClose={() => {
              handler.close();
            }}
          />
        )}
      </div>
    </ContextualMenu>
  );
};
