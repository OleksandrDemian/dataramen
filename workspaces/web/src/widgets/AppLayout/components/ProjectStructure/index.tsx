import {useCurrentUser} from "../../../../data/queries/users.ts";
import st from "./index.module.css";
import {useLocation, useNavigate} from "react-router-dom";
import {useTeamDataSources, useTeamSavedQueries} from "../../../../data/queries/project.ts";
import {ContextualMenu} from "../../../ExplorerView/components/ContextualMenu.tsx";
import {useUpdateQuery} from "../../../../data/queries/queries.ts";
import {useContextMenuHandler} from "../../../ExplorerView/components/ContextualMenu.handler.ts";
import {prompt} from "../../../../data/promptModalStore.ts";
import {PAGES} from "../../../../const/pages.ts";
import {pushNewExplorerTab, setActiveTab, useOpenTabs} from "../../../../data/openTabsStore.ts";
import {setDataSourceModal} from "../../../../data/dataSourceModalStore.ts";
import {fetchQueryById} from "../../../../data/queries/queries.utils.ts";
import {createTableOptions} from "../../../ExplorerView/utils.ts";
import {useGlobalHotkey} from "../../../../hooks/useGlobalHotkey.ts";
import {Analytics} from "../../../../utils/analytics.ts";
import { TProjectDataSource } from "@dataramen/types";
import {DataSourceIcon} from "../../../Icons";
import {gte} from "../../../../utils/numbers.ts";

const Query = ({
  name,
  id,
  onRename,
  onDelete,
  onOpen,
}: {
  name: string;
  id: string;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
}) => {
  const contextHandler = useContextMenuHandler();

  return (
    <button
      className={st.menu}
      onContextMenu={contextHandler.open}
      onClick={() => onOpen(id)}
    >
      <ContextualMenu handler={contextHandler}>
        <div className="context-menu-container">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              contextHandler.close();
              onRename(id);
            }}
            className="context-menu-item"
          >
            ✏️ Rename
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              contextHandler.close();
              onDelete(id);
            }}
            className="context-menu-item"
          >
            🗑️ Delete
          </button>
        </div>
      </ContextualMenu>
      <span>📖 {name}</span>
    </button>
  );
};

const Datasource = ({ dataSource, index }: { dataSource: TProjectDataSource, index: number }) => {
  const onOpen = () => {
    setDataSourceModal(dataSource.id);
    Analytics.event("On open datasource [Sidebar]");
  };

  useGlobalHotkey(index.toString(), () => {
    setDataSourceModal((cur) => {
      if (cur === dataSource.id) return undefined;
      return dataSource.id;
    });
    Analytics.event("On open datasource [Hotkey]");
  }, dataSource.name);

  return (
    <button className={st.menu} onClick={onOpen}>
      <DataSourceIcon size={20} type={dataSource.dbType} />
      <p className="truncate flex-1 text-left mx-1.5">{dataSource.name}</p>
      <span className="hotkey">{index}</span>
    </button>
  );
};

export const ProjectStructure = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: user } = useCurrentUser();
  const { data: projectDataSources } = useTeamDataSources(user?.teamId);
  const { data: projectQueries } = useTeamSavedQueries(user?.teamId);
  const workbenchTabs = useOpenTabs();

  const updateQuery = useUpdateQuery();

  const openQuery = (queryId: string) => {
    fetchQueryById(queryId)
      .then((result) => {
        pushNewExplorerTab(result.name, createTableOptions(result.opts), true);
        if (location.pathname !== PAGES.workbench.path) {
          navigate(PAGES.workbench.path);
        }
      });
    Analytics.event("On open query [Sidebar]");
  };

  const updateQueryName = async (queryId: string) => {
    const current = projectQueries?.find((query) => query.id === queryId);
    const name = await prompt("New name?", current?.name);
    if (name) {
      updateQuery.mutate({
        id: queryId,
        payload: {
          name,
        },
      });
    }
  };

  const deleteQuery = (queryId: string) => {
    updateQuery.mutate({
      id: queryId,
      payload: {
        isTrash: true,
      },
    });
  };

  const onOpenTab = (tabId: string) => {
    setActiveTab(tabId);
    if (location.pathname !== PAGES.workbench.path) {
      navigate(PAGES.workbench.path);
    }
  };

  return (
    <div className={st.container}>
      <div className="flex-1 overflow-y-auto">
        {gte(projectDataSources?.length, 0) && (
          <div className="mt-4">
            <p className="font-semibold text-sm text-gray-600 mb-2">DATA SOURCES</p>
            {projectDataSources.map((dataSource, index) => (
              <Datasource dataSource={dataSource} key={dataSource.id} index={index + 1} />
            ))}
          </div>
        )}

        {gte(projectQueries?.length, 0) && (
          <div className="mt-4">
            <p className="font-semibold text-sm text-gray-600 mb-2">SAVED QUERIES</p>
            {projectQueries.map((file) => (
              <Query
                onDelete={deleteQuery}
                onRename={updateQueryName}
                onOpen={openQuery}
                name={file.name}
                id={file.id}
                key={file.id}
              />
            ))}
          </div>
        )}

        {gte(workbenchTabs?.length, 0) && (
          <div className="mt-4">
            <p className="font-semibold text-sm text-gray-600 mb-2">WORKBENCH TABS</p>
            {workbenchTabs?.map((tab) => (
              <button key={tab.id} className={st.menu} onClick={() => onOpenTab(tab.id)}>
                📄 {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
