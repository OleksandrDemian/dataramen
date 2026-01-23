import {useSearchTable} from "../../data/tableSearchModalStore.ts";
import {useState} from "react";
import {useRequireRole} from "../../hooks/useRequireRole.ts";
import toast from "react-hot-toast";
import {Analytics} from "../../utils/analytics.ts";
import {CreateDatasourceModal} from "../../widgets/AppLayout/components/CreateDatasource";
import st from "./index.module.css";
import {DataSourceIcon} from "../../widgets/Icons";
import {EUserTeamRole} from "@dataramen/types";
import {useNavigate} from "react-router-dom";
import {PAGES} from "../../const/pages.ts";
import {useCurrentUser} from "../../data/queries/users.ts";
import {useDataSources} from "../../data/queries/dataSources.ts";
import {setDataSourceModal} from "../../data/dataSourceModalStore.ts";
import {useWorkbenchTabs} from "../../data/queries/workbenchTabs.ts";
import {useRecentTabs} from "../../data/queries/project.ts";
import GithubIcon from "../../assets/logo-github.svg?react";
import NpmIcon from "../../assets/logo-npm.svg?react";
import DocumentationIcon from "../../assets/document-text-outline.svg?react";
import LockIcon from "../../assets/lock-closed-outline.svg?react";

export const StartQuery = () => {
  const searchAndOpen = useSearchTable("Home");

  return (
    <div className={st.homeActionButton} onClick={searchAndOpen}>
      <h2 className={st.actionTitle}>
        <span className="truncate">🔎 Start new query</span>
        <span className="hotkey">N</span>
      </h2>
    </div>
  );
};

export const SavedQueriesAction = () => {
  const navigate = useNavigate();

  return (
    <div className={st.homeActionButton} onClick={() => navigate(PAGES.savedQueries.build())}>
      <h2 className={st.actionTitle}>
        <span className="truncate">💾 Saved queries</span>
      </h2>
    </div>
  );
};

export const ConnectDataSource = () => {
  const [showNewDataSource, setShowNewDataSource] = useState<string | undefined>(undefined);
  const isEditor = useRequireRole(EUserTeamRole.EDITOR);

  const onCreateNewDataSource = (dbType: string) => {
    if (isEditor) {
      setShowNewDataSource(dbType);
    } else {
      toast.error("You don't have permission to connect new data sources in this team");
    }

    Analytics.event(`On create new [${dbType}]`);
  };

  return (
    <div>
      {showNewDataSource && (
        <CreateDatasourceModal
          show
          dbType={showNewDataSource}
          onClose={() => setShowNewDataSource(undefined)}
        />
      )}

      <div
        className={st.homeActionButton}
        onClick={() => onCreateNewDataSource("postgres")}
      >
        <p className={st.actionTitle}>🧙‍♂️ Connection wizard</p>
      </div>
    </div>
  );
};

export const WorkbenchTabs = () => {
  const navigate = useNavigate();
  const { data: tabs } = useWorkbenchTabs();
  const searchAndOpen = useSearchTable("Home");

  const onOpenWorkbench = () => {
    if (tabs && tabs.length > 0) {
      navigate(PAGES.workbenchTab.build({ id: tabs[0].id }));
      Analytics.event("On open workbench [Home]");
    } else {
      searchAndOpen();
    }
  };

  return (
    <div className={st.homeActionButton} onClick={onOpenWorkbench}>
      <h2 className={st.actionTitle}>
        <span>🛠️ Workbench</span>
        <span className="hotkey">W</span>
      </h2>
    </div>
  );
};

export const ListDataSources = () => {
  const { data: user } = useCurrentUser();
  const { data: dataSources } = useDataSources({
    teamId: user?.teamId,
  });

  const onOpen = (id: string) => {
    setDataSourceModal(id);
    Analytics.event("On open datasource [Home]");
  };

  if (!dataSources || dataSources.length === 0) {
    return null;
  }

  return (
    <div className={st.homeGrayCard}>
      <h2 className={st.homeCardTitle}>Data sources</h2>

      <div className={st.homeCardGridContent}>
        {dataSources?.map((d) => (
          <div key={d.id} className={st.dataSourceEntry} onClick={() => onOpen(d.id)} tabIndex={0}>
            {!d.allowInsert && (
              <LockIcon
                data-tooltip-id="default"
                data-tooltip-content="This datasource is read-only"
                width={18}
                height={18}
                className="absolute top-2 right-2"
              />
            )}

            <DataSourceIcon size={32} type={d.dbType} />
            <div className="overflow-hidden">
              <p className="text-(--text-color-primary) font-semibold truncate">{d.name}</p>
              <p className="text-sm text-(--text-color-secondary) truncate">{d.dbUrl}:{d.dbPort}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UsefulLinkIconSize = 24;
export const UsefulLinks = () => {
  return (
    <div className={st.usefulLinks}>
      <a href="https://dataramen.xyz/" target="_blank">
        <DocumentationIcon width={UsefulLinkIconSize} height={UsefulLinkIconSize} />
        <span>Docs</span>
      </a>

      <a href="https://github.com/OleksandrDemian/dataramen" target="_blank">
        <GithubIcon width={UsefulLinkIconSize} height={UsefulLinkIconSize} />
        <span>GitHub</span>
      </a>

      <a href="https://www.npmjs.com/package/@dataramen/cli" target="_blank">
        <NpmIcon width={UsefulLinkIconSize} height={UsefulLinkIconSize} />
        <span>NPM</span>
      </a>
    </div>
  );
};

export const RecentTabs = () => {
  const { data: user } = useCurrentUser();
  const { data: tabs, isLoading } = useRecentTabs(user?.teamId);
  const navigate = useNavigate();

  if (isLoading || !tabs?.length) {
    return null;
  }

  const openTab = (tabId: string) => {
    navigate(PAGES.workbenchTab.build({ id: tabId }));
  };

  return (
    <div className={st.recentTabsContainer}>
      <h2 className={st.homeCardTitle + " px-4 mb-4"}>Recent tabs</h2>

      {tabs.map((tab) => (
        <div className={st.recentTabsEntry} key={tab.id} onClick={() => openTab(tab.id)}>
          <p className="text-(--text-color-primary) truncate">{tab.name}</p>
          <p className="flex items-center gap-2">
            <DataSourceIcon size={20} type={tab.dataSourceType!} />
            <span className="text-sm text-(--text-color-secondary) truncate">{tab.dataSourceName}</span>
          </p>
        </div>
      ))}
    </div>
  )
};