import st from "./index.module.css";
import {useLocation, useNavigate} from "react-router-dom";
import {PAGES} from "../../../const/pages.ts";
import {useSearchTable} from "../../../data/tableSearchModalStore.ts";

export const MobileNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const searchTable = useSearchTable("Mobile nav");

  const onHome = () => {
    if (pathname !== PAGES.home.path) {
      navigate(PAGES.home.path);
    }
  }

  return (
    <div className={st.root}>
      <button onClick={onHome}>
        <p>🏠</p>
        <p className="text-xs font-semibold text-gray-600">Home</p>
      </button>

      <button onClick={searchTable}>
        <p>🔎</p>
        <p className="text-xs font-semibold text-gray-600">New query</p>
      </button>
    </div>
  );
};
