import st from "./index.module.css";
import {ProjectStructure} from "../components/ProjectStructure";
import {useCurrentUser} from "../../../data/queries/users.ts";
import {openAccountSettingsModal} from "../../../data/accountSettingsModalStore.ts";
import {openPeopleSettings} from "../../../data/peopleSettingsModalStore.ts";
import {PAGES} from "../../../const/pages.ts";
import {useLocation, useNavigate} from "react-router-dom";
import {useSearchTable} from "../../../data/tableSearchModalStore.ts";
import {updateShowTabsHistory} from "../../../data/showTabsHistorySidebarStore.ts";
import ChevronIcon from "../../../assets/chevron-forward-outline.svg?react";
import DockerIcon from "../../../assets/logo-docker.svg?react";
import TerminalIcon from "../../../assets/terminal-outline.svg?react";
import CubeIcon from "../../../assets/cube-outline.svg?react";
import LogOutIcon from "../../../assets/log-out-outline.svg?react";
import {useState} from "react";
import clsx from "clsx";
import {gt} from "../../../utils/numbers.ts";
import {useWorkbenchTabs} from "../../../data/queries/workbenchTabs.ts";
import {AccessTokenHandler} from "../../../services/accessTokenHandler.ts";
import {confirm} from "../../../data/confirmModalStore.ts";

const enableAuth = !__CLIENT_CONFIG__.skipAuth;
const runtimeName = (() => {
  const version = __CLIENT_CONFIG__.serverVersion || '--';
  switch (__CLIENT_CONFIG__.modeName) {
    case "docker": return `v${version} | Docker`;
    case "cli": return `v${version} | CLI`;
    case "dev": return `v${version} | DEV`;
    default: return `v${version} | Custom`;
  }
})();

function ConfigIcon () {
  const size = 20;
  switch (__CLIENT_CONFIG__.modeName) {
    case 'docker':
      return <DockerIcon className="text-(--text-color-secondary)" width={size} height={size} />;
    case 'cli':
      return <TerminalIcon className="text-(--text-color-secondary)" width={size} height={size} />;
    default:
      return <CubeIcon className="text-(--text-color-secondary)" width={size} height={size} />;
  }
}

export const Nav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: currentUser } = useCurrentUser();
  const searchTable = useSearchTable("Desktop nav");
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);
  const { data: workbenchTabs } = useWorkbenchTabs();

  const onHome = () => {
    if (!PAGES.home.check(pathname)) {
      navigate(PAGES.home.build());
    }
  };

  const onWorkbench = (id: string) => {
    if (!PAGES.workbenchTab.check(pathname)) {
      navigate(PAGES.workbenchTab.build({ id }));
    }
  };

  const onSavedQueries = () => {
    if (!PAGES.savedQueries.check(pathname)) {
      navigate(PAGES.savedQueries.build());
    }
  };

  const onLogout = () => {
    confirm("Are you sure you want to logout?")
      .then((result) => {
        if (result) {
          navigate("/");
          AccessTokenHandler.logout();
        }
      });
  };

  const onShowRecentTabs = () => updateShowTabsHistory({ show: true });
  const tooltipId = showSidebarMenu ? undefined : "default";

  return (
    <nav className={clsx(st.nav, showSidebarMenu ? st.shown : st.hidden)}>
      {currentUser && (
        <div className={st.header}>
          <button
            onClick={onHome}
            className={st.navItem}
            data-tooltip-id={tooltipId}
            data-tooltip-content="Home"
          >
            <span className={st.icon}>🏠</span>
            <span className="truncate">Home</span>
          </button>

          <button
            onClick={searchTable}
            className={st.navItem}
            data-tooltip-id={tooltipId}
            data-tooltip-content="New query"
          >
            <span className={st.icon}>🔎</span>
            <span className="truncate">New query</span>
            <span className="hotkey secondary">N</span>
          </button>

          <button
            onClick={onShowRecentTabs}
            className={st.navItem}
            data-tooltip-id={tooltipId}
            data-tooltip-content="Recent tabs"
          >
            <span className={st.icon}>⌛</span>
            <span className="truncate">Recent tabs</span>
            <span className="hotkey secondary">H</span>
          </button>

          <button
            onClick={onSavedQueries}
            className={st.navItem}
            data-tooltip-id={tooltipId}
            data-tooltip-content="Saved queries"
          >
            <span className={st.icon}>💾</span>
            <span className="truncate">Saved queries</span>
          </button>

          {gt(workbenchTabs?.length, 0) && (
            <button
              onClick={() => onWorkbench(workbenchTabs[0].id)}
              className={st.navItem}
              data-tooltip-id={tooltipId}
              data-tooltip-content="Workbench"
            >
              <span className={st.icon}>🛠️</span>
              <span className="truncate">Workbench</span>
            </button>
          )}

          {enableAuth && (
            <>
              <button
                onClick={openAccountSettingsModal}
                className={st.navItem}
                data-tooltip-id={tooltipId}
                data-tooltip-content="User settings"
              >
                <span className={st.icon}>🪪</span>
                <span className="truncate">{currentUser.username}</span>
              </button>

              <button
                onClick={openPeopleSettings}
                className={st.navItem}
                data-tooltip-id={tooltipId}
                data-tooltip-content="Manage users"
              >
                <span className={st.icon}>👥</span>
                <span className="truncate">Manage users</span>
              </button>
            </>
          )}
        </div>
      )}

      <div className={clsx(st.projectWrapper, showSidebarMenu ? st.show : st.hide)}>
        <ProjectStructure />
      </div>

      <button
        onClick={() => setShowSidebarMenu(!showSidebarMenu)}
        data-tooltip-id="default"
        data-tooltip-content="Expand sidebar"
        data-tooltip-hidden={showSidebarMenu}
        data-tooltip-place="right"
        className={`${st.navItem} mx-2`}
      >
        <span className={clsx(st.icon, st.expand, showSidebarMenu ? st.show : st.hide)}>
          <ChevronIcon className="text-(--text-color-secondary)" width={20} height={20} />
        </span>
        <span className="truncate text-sm text-(--text-color-secondary)">Collapse menu</span>
      </button>

      {enableAuth && (
        <button
          onClick={onLogout}
          data-tooltip-id={tooltipId}
          data-tooltip-content="Logout"
          className={`${st.navItem} mx-2`}
        >
        <span className={st.icon}>
          <LogOutIcon className="text-(--text-color-secondary)" width={20} height={20} />
        </span>
          <span className="truncate text-sm text-(--text-color-secondary)">Logout</span>
        </button>
      )}

      <div
        className={`${st.navItem} mx-2 cursor-auto!`}
        data-tooltip-id={tooltipId}
        data-tooltip-content={runtimeName}
      >
        <span className={st.icon}>
          <ConfigIcon />
        </span>
        <span className="truncate text-sm text-(--text-color-secondary)">{runtimeName}</span>
      </div>
    </nav>
  );
};
