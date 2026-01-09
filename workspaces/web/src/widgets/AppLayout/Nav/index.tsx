import st from "./index.module.css";
import {ProjectStructure} from "../components/ProjectStructure";
import {useCurrentUser} from "../../../data/queries/users.ts";
import {openAccountSettingsModal} from "../../../data/accountSettingsModalStore.ts";
import {openPeopleSettings} from "../../../data/peopleSettingsModalStore.ts";
import {closeMenuSidebar} from "../../../data/showSidebarMenuStore.ts";
import {PAGES} from "../../../const/pages.ts";
import {useLocation, useNavigate} from "react-router-dom";
import {useSearchTable} from "../../../data/tableSearchModalStore.ts";
import {updateShowTabsHistory} from "../../../data/showTabsHistorySidebarStore.ts";
import ChevronIcon from "../../../assets/chevron-forward-outline.svg?react";
import {useState} from "react";
import clsx from "clsx";

const enableAuth = !__CLIENT_CONFIG__.skipAuth;

export const Nav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: currentUser } = useCurrentUser();
  const searchTable = useSearchTable("Desktop nav");
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);

  const onHome = () => {
    closeMenuSidebar();
    if (pathname !== PAGES.home.path) {
      navigate(PAGES.home.path);
    }
  };

  const onShowRecentTabs = () => updateShowTabsHistory({ show: true });
  const tooltipId = showSidebarMenu ? undefined : 'default';

  return (
    <nav className={clsx(st.nav, showSidebarMenu ? st.shown : st.hidden)}>
      {currentUser && (
        <div className={st.header}>
          <button onClick={() => setShowSidebarMenu(!showSidebarMenu)} className={`${st.navItem} mb-4`}>
            <span className={clsx(st.expand, showSidebarMenu ? st.show : st.hide)}>
              <ChevronIcon width={20} height={20} />
            </span>
            <span className="text-(--text-color-tertiary) text-sm">Hide sidebar</span>
          </button>

          <button onClick={onHome} className={st.navItem} data-tooltip-content="Go home" data-tooltip-id={tooltipId}>
            <span className={st.icon}>🏠</span>
            <span>Home</span>
          </button>

          <button onClick={searchTable} className={st.navItem} data-tooltip-content="New query" data-tooltip-id={tooltipId}>
            <span className={st.icon}>🔎</span>
            <span>New query</span>
            <span className="hotkey secondary">N</span>
          </button>

          <button onClick={onShowRecentTabs} className={st.navItem} data-tooltip-content="Recent tabs" data-tooltip-id={tooltipId}>
            <span className={st.icon}>⌛</span>
            <span>Recent tabs</span>
            <span className="hotkey secondary">H</span>
          </button>

          {enableAuth && (
            <>
              <button onClick={openAccountSettingsModal}>
                🪪 {currentUser.username}
              </button>
              <button onClick={openPeopleSettings}>
                👥 Manage users
              </button>
            </>
          )}
        </div>
      )}

      <div className={clsx(st.projectWrapper, showSidebarMenu ? st.show : st.hide)}>
        <ProjectStructure />
      </div>
    </nav>
  );
};
