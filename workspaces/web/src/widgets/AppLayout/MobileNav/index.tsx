import st from "./index.module.css";
import {useLocation, useNavigate} from "react-router-dom";
import {PAGES} from "../../../const/pages.ts";
import {openAccountSettingsModal} from "../../../data/accountSettingsModalStore.ts";
import {openPeopleSettings} from "../../../data/peopleSettingsModalStore.ts";
import {useSearchTable} from "../../../data/tableSearchModalStore.ts";
import {useOpenTabs} from "../../../data/openTabsStore.ts";

export const MobileNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const searchTable = useSearchTable("Mobile home workbench");
  const tabs = useOpenTabs();

  const onHome = () => {
    if (pathname !== PAGES.home.path) {
      navigate(PAGES.home.path);
    }
  }

  const onWorkbench = () => {
    if (tabs.length < 1) {
      searchTable();
    } else if (pathname !== PAGES.workbench.path) {
      navigate(PAGES.workbench.path);
    }
  }

  return (
    <div className={st.root}>
      <button onClick={onHome}>
        <p>🏠</p>
        <p className="text-xs font-semibold text-gray-600">Home</p>
      </button>

      <button onClick={onWorkbench}>
        <p>🛠️</p>
        <p className="text-xs font-semibold text-gray-600">Workbench</p>
      </button>

      <button onClick={openAccountSettingsModal}>
        <p>🪪</p>
        <p className="text-xs font-semibold text-gray-600">Account</p>
      </button>

      <button onClick={openPeopleSettings}>
        <p>👥</p>
        <p className="text-xs font-semibold text-gray-600">Users</p>
      </button>
    </div>
  );
};
