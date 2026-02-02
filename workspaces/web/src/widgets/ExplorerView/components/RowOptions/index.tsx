import st from "./index.module.css";
import {TContextMenuHandler} from "../ContextualMenu.handler.ts";
import {ContextualMenu} from "../ContextualMenu.tsx";
import {DrillDown} from "./DrillDown.tsx";

export type TRowOptionsProps = {
  handler: TContextMenuHandler;
  rowIndex: number;
  colIndex: number;
};
export const CellDrillDown = ({ handler, rowIndex, colIndex }: TRowOptionsProps) => {
  return (
    <ContextualMenu handler={handler}>
      <div className={st.optionsContainer}>
        <DrillDown
          rowIndex={rowIndex}
          colIndex={colIndex}
          className="p-2"
          onClose={() => {
            handler.close();
          }}
        />
      </div>
    </ContextualMenu>
  );
};
