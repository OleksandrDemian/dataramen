import {THook} from "../../data/types/hooks.ts";
import st from "./index.module.css";

export type THookButtonProps = {
  hook: THook;
  onClick: VoidFunction;
};
export const HookButton = ({ hook, onClick }: THookButtonProps) => {
  return (
    <button
      key={hook.where}
      className={st.root}
      onClick={onClick}
    >
      <span>📄</span>
      <div className={st.content}>
        <p className={st.table}> {hook.on.toTable}</p>
        <span className={st.sub}>{hook.on.toColumn} = {hook.on.fromTable}.{hook.on.fromColumn}</span>
      </div>
    </button>
  );
};
