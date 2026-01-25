import st from "./index.module.css";
import {useCurrentUser} from "../../../data/queries/users.ts";
import {openAccountSettingsModal} from "../../../data/accountSettingsModalStore.ts";
import {openPeopleSettings} from "../../../data/peopleSettingsModalStore.ts";
import {PAGES} from "../../../const/pages.ts";
import {useLocation, useNavigate} from "react-router-dom";
import {useSearchTable} from "../../../data/tableSearchModalStore.ts";
import {updateShowSavedQueries, updateShowTabsHistory} from "../../../data/sidebarDispatchersStore.ts";
import ChevronIcon from "../../../assets/chevron-forward-outline.svg?react";
import DockerIcon from "../../../assets/logo-docker.svg?react";
import TerminalIcon from "../../../assets/terminal-outline.svg?react";
import CubeIcon from "../../../assets/cube-outline.svg?react";
import LogOutIcon from "../../../assets/log-out-outline.svg?react";
import HomeIcon from "../../../assets/home-outline.svg?react";
import SearchIcon from "../../../assets/search-outline.svg?react";
import RecentIcon from "../../../assets/hourglass-outline.svg?react";
import WorkbenchIcon from "../../../assets/construct-outline.svg?react";
import UserIcon from "../../../assets/person-outline.svg?react";
import GroupIcon from "../../../assets/people-outline.svg?react";
import SavedIcon from "../../../assets/save-outline.svg?react";
import {useState} from "react";
import clsx from "clsx";
import {gt} from "../../../utils/numbers.ts";
import {useWorkbenchTabs} from "../../../data/queries/workbenchTabs.ts";
import {AccessTokenHandler} from "../../../services/accessTokenHandler.ts";
import {confirm} from "../../../data/confirmModalStore.ts";
import stNav from "./index.module.css";
import {setDataSourceModal} from "../../../data/sidebarDispatchersStore.ts";
import {DataSourceIcon} from "../../Icons";
import { TProjectDataSource } from "@dataramen/types";
import {useTeamDataSources} from "../../../data/queries/project.ts";

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

const navIconSize = 20;
const navIconStyle = "text-(--text-color-primary)";

function ConfigIcon () {
  switch (__CLIENT_CONFIG__.modeName) {
    case 'docker':
      return <DockerIcon className={navIconStyle} width={navIconSize} height={navIconSize} />;
    case 'cli':
      return <TerminalIcon className={navIconStyle} width={navIconSize} height={navIconSize} />;
    default:
      return <CubeIcon className={navIconStyle} width={navIconSize} height={navIconSize} />;
  }
}

const Datasource = ({ dataSource }: { dataSource: TProjectDataSource }) => {
  return (
    <button
      className={stNav.navItem}
      onClick={() => setDataSourceModal(dataSource.id)}
      data-tooltip-id="default"
      data-tooltip-content={dataSource.name}
      data-tooltip-place="right"
    >
      <span className={stNav.icon}>
        <DataSourceIcon size={20} type={dataSource.dbType} />
      </span>
      <span className="truncate">{dataSource.name}</span>
    </button>
  );
};

export const Nav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: currentUser } = useCurrentUser();
  const searchTable = useSearchTable("Desktop nav");
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);
  const { data: workbenchTabs } = useWorkbenchTabs();
  const { data: dataSources } = useTeamDataSources(currentUser?.teamId);

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
    updateShowSavedQueries({ show: true });
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
            <span className={st.icon}>
              <HomeIcon className={navIconStyle} width={navIconSize} height={navIconSize} />
            </span>
            <span className="truncate">Home</span>
          </button>

          <button
            onClick={searchTable}
            className={st.navItem}
            data-tooltip-id={tooltipId}
            data-tooltip-content="New query"
          >
            <span className={st.icon}>
              <SearchIcon className={navIconStyle} width={navIconSize} height={navIconSize} />
            </span>
            <span className="truncate">New query</span>
            <span className="hotkey secondary">N</span>
          </button>

          <button
            onClick={onShowRecentTabs}
            className={st.navItem}
            data-tooltip-id={tooltipId}
            data-tooltip-content="Recent tabs"
          >
            <span className={st.icon}>
              <RecentIcon className={navIconStyle} width={navIconSize} height={navIconSize} />
            </span>
            <span className="truncate">Recent tabs</span>
            <span className="hotkey secondary">H</span>
          </button>

          <button
            onClick={onSavedQueries}
            className={st.navItem}
            data-tooltip-id={tooltipId}
            data-tooltip-content="Saved queries"
          >
            <span className={st.icon}>
              <SavedIcon className={navIconStyle} width={navIconSize} height={navIconSize} />
            </span>
            <span className="truncate">Saved queries</span>
          </button>

          {gt(workbenchTabs?.length, 0) && (
            <button
              onClick={() => onWorkbench(workbenchTabs[0].id)}
              className={st.navItem}
              data-tooltip-id={tooltipId}
              data-tooltip-content="Workbench"
            >
              <span className={st.icon}>
                <WorkbenchIcon className={navIconStyle} width={navIconSize} height={navIconSize} />
              </span>
              <span className="truncate">Workbench</span>
              <span className="hotkey secondary">W</span>
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
                <span className={st.icon}>
                  <UserIcon className={navIconStyle} width={navIconSize} height={navIconSize} />
                </span>
                <span className="truncate">{currentUser.username}</span>
              </button>

              <button
                onClick={openPeopleSettings}
                className={st.navItem}
                data-tooltip-id={tooltipId}
                data-tooltip-content="Manage users"
              >
                <span className={st.icon}>
                  <GroupIcon className={navIconStyle} width={navIconSize} height={navIconSize} />
                </span>
                <span className="truncate">Manage users</span>
              </button>
            </>
          )}
        </div>
      )}

      <div className={clsx(st.projectWrapper)}>
        {gt(dataSources?.length, 0) && (
          <div className="mt-4 flex flex-col">
            {dataSources.map((dataSource) => (
              <Datasource dataSource={dataSource} key={dataSource.id} />
            ))}
          </div>
        )}
      </div>

      {enableAuth && (
        <button
          onClick={onLogout}
          data-tooltip-id={tooltipId}
          data-tooltip-content="Logout"
          className={`${st.navItem} mx-1`}
        >
        <span className={st.icon}>
          <LogOutIcon className={navIconStyle} width={20} height={20} />
        </span>
          <span className="truncate text-sm text-(--text-color-primary)">Logout</span>
        </button>
      )}

      <div
        className={`${st.navItem} mx-1 cursor-auto!`}
        data-tooltip-id={tooltipId}
        data-tooltip-content={runtimeName}
      >
        <span className={st.icon}>
          <ConfigIcon />
        </span>
        <span className="truncate text-sm text-(--text-color-primary)">{runtimeName}</span>
      </div>

      <button
        onClick={() => setShowSidebarMenu(!showSidebarMenu)}
        data-tooltip-id="default"
        data-tooltip-content="Expand sidebar"
        data-tooltip-hidden={showSidebarMenu}
        data-tooltip-place="right"
        className={`${st.navItem} mx-1`}
      >
        <span className={clsx(st.icon, st.expand, showSidebarMenu ? st.show : st.hide)}>
          <ChevronIcon className={navIconStyle} width={20} height={20} />
        </span>
        <span className="truncate text-sm text-(--text-color-primary)">Collapse menu</span>
      </button>
    </nav>
  );
};
