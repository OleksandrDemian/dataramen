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
import {useOpenTabs} from "../../data/openTabsStore.ts";

export const StartQuery = () => {
  const searchAndOpen = useSearchTable("Home");

  return (
    <div className="card-white lg:col-span-2" onClick={searchAndOpen}>
      <h2 className={st.actionTitle}>
        <span>🔎 Start new query</span>
        <span className="hotkey">N</span>
      </h2>
      <input className="input mt-3 w-full" placeholder="Search table or query to start" />
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
        className="card-white hover:bg-gray-50! cursor-pointer"
        onClick={() => onCreateNewDataSource("postgres")}
      >
        <p className={st.actionTitle}>🧙‍♂️ Connection wizard</p>
        <p className={st.actionSubtext}>Configure new database connection.</p>
      </div>
    </div>
  );
};

export const WorkbenchTabs = () => {
  const navigate = useNavigate();
  const tabs = useOpenTabs();
  const searchAndOpen = useSearchTable("Home");

  const onOpenWorkbench = () => {
    if (tabs.length > 0) {
      navigate(PAGES.workbench.path);
      Analytics.event("On open workbench [Home]");
    } else {
      searchAndOpen();
    }
  };

  return (
    <div className="card-white hover:bg-gray-50! cursor-pointer" onClick={onOpenWorkbench}>
      <h2 className={st.actionTitle}>
        <span>🛠️ Workbench</span>
        <span className="hotkey">W</span>
      </h2>

      <p className={st.actionSubtext}>Continue your work from where you left.</p>
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
    <div className="mt-8">
      <h2 className="font-semibold text-gray-700">Data sources</h2>

      <div className="grid lg:grid-cols-2 gap-2 mt-4">
        {dataSources?.map((d) => (
          <div key={d.id} className={st.dataSourceEntry} onClick={() => onOpen(d.id)} tabIndex={0}>
            <DataSourceIcon size={32} type={d.dbType} />
            <p className="font-semibold truncate text-gray-800 flex-1">{d.name}</p>
            {d.allowInsert ? <span className="text-red-700">Development</span> : <span className="text-blue-700">Production</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export const UsefulLinks = () => {
  return (
    <div className="mt-8">
      <h2 className="font-semibold text-gray-700">Useful links</h2>

      <div className="grid lg:grid-cols-2 gap-2 mt-4">
        <a className="card-white hover:bg-gray-50!" href="https://dataramen.xyz/">
          <p className={st.actionTitle}>Documentation</p>
          <p className={st.actionSubtext}>Learn how to use DataRamen</p>
        </a>

        <a className="card-white hover:bg-gray-50!" href="https://github.com/OleksandrDemian/dataramen">
          <p className={st.actionTitle}>Github</p>
          <p className={st.actionSubtext}>Codebase is open sourced on Github</p>
        </a>
      </div>
    </div>
  );
};