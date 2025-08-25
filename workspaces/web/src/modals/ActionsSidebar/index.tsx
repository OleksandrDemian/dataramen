import st from "./index.module.css";
import {ReactNode} from "react";

export const ActionsSidebar = ({ children }: { children: ReactNode }) => {
  return (
    <div className={st.actions}>
      {children}
    </div>
  );
};
