import st from "./index.module.css";
import { IHook } from "@dataramen/types";

export type THookButtonProps = {
  hook: IHook;
  onClick: VoidFunction;
};
export const HookButton = ({ hook, onClick }: THookButtonProps) => {
  if (hook.direction === "out") {
    return (
      <button
        key={hook.id}
        className={st.root}
        onClick={onClick}
      >
        <div className={st.content}>
          <p className={st.tableName}>{hook.toTable}</p>
          <p className={st.sub}>{hook.toColumn} = {hook.fromTable}.{hook.fromColumn}</p>
        </div>
      </button>
    );
  }

  return (
    <button
      key={hook.id}
      className={st.root}
      onClick={onClick}
    >
      <div className={st.content}>
        <p className={st.tableName}>{hook.fromTable}</p>
        <p className={st.sub}>{hook.fromColumn} = {hook.toTable}.{hook.toColumn}</p>
      </div>
    </button>
  );
};
