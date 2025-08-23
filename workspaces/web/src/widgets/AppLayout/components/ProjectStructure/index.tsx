import {useCurrentUser} from "../../../../data/queries/users.ts";
import st from "./index.module.css";
import {useLocation, useNavigate} from "react-router-dom";
import {useTeamProjectFiles} from "../../../../data/queries/project.ts";
import {ContextualMenu} from "../../../ExplorerView/components/ContextualMenu.tsx";
import {useUpdateQuery} from "../../../../data/queries/queries.ts";
import {useContextMenuHandler} from "../../../ExplorerView/components/ContextualMenu.handler.ts";
import {prompt} from "../../../../data/promptModalStore.ts";
import {PAGES} from "../../../../const/pages.ts";
import {pushNewExplorerTab, useOpenTabs} from "../../../../data/openTabsStore.ts";
import {setDataSourceModal} from "../../../../data/dataSourceModalStore.ts";
import {fetchQueryById} from "../../../../data/queries/queries.utils.ts";
import {createTableOptions} from "../../../ExplorerView/utils.ts";
import {useSearchTable} from "../../../../data/tableSearchModalStore.ts";
import {useGlobalHotkey} from "../../../../hooks/useGlobalHotkey.ts";
import {Analytics} from "../../../../utils/analytics.ts";
import {closeMenuSidebar} from "../../../../data/showSidebarMenuStore.ts";

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
      className={st.file}
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

const Datasource = ({ name, id, index }: { name: string; id: string; index: number; }) => {
  const displayName = `📦 ${name}`;

  const onOpen = () => {
    setDataSourceModal(id);
    Analytics.event("On open datasource [Sidebar]");
  };

  useGlobalHotkey(index.toString(), () => {
    setDataSourceModal((cur) => {
      if (cur === id) return undefined;
      return id;
    });
    Analytics.event("On open datasource [Hotkey]");
  }, displayName);

  return (
    <button className={st.menu} onClick={onOpen}>
      <span className="truncate">{displayName}</span><span className="hotkey">{index}</span>
    </button>
  );
};

export const ProjectStructure = () => {
  const hasOpenedTabs = useOpenTabs((t) => t.length > 0);
  const navigate = useNavigate();
  const location = useLocation();
  const searchAndOpen = useSearchTable("Sidebar");

  const { data: user } = useCurrentUser();
  const { data: files } = useTeamProjectFiles(user?.teamId);

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
    const current = files?.find((file) => file.id === queryId);
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

  const onWorkbench = () => {
    if (!hasOpenedTabs) {
      searchAndOpen();
    } else if (location.pathname !== PAGES.workbench.path) {
      navigate(PAGES.workbench.path);
    }

    Analytics.event("On open workbench [Sidebar]");
  };

  const onNewQuery = () => {
    closeMenuSidebar();
    searchAndOpen();
  };

  const onHome = () => {
    closeMenuSidebar();
    navigate(PAGES.home.path);
  };

  let datasourceIndex: number = 1;
  return (
    <div className={st.container}>
      <div className="mb-4">
        <button onClick={onHome} className={st.menu}><span>{PAGES.home.name}</span><span className="hotkey">H</span></button>
        <button disabled={!user} onClick={onNewQuery} className={st.menu}><span>🔎 Start new query</span><span className="hotkey">N</span></button>
        <button disabled={!user} onClick={onWorkbench} className={st.menu}><span>🛠️ Workbench</span><span className="hotkey">W</span></button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {files?.map((file) => {
          switch (file.type) {
            case "query":
              return (
                <Query
                  onDelete={deleteQuery}
                  onRename={updateQueryName}
                  onOpen={openQuery}
                  name={file.name}
                  id={file.id}
                  key={file.id}
                />
              )
            case "dataSource":
              return <Datasource name={file.name} id={file.id} key={file.id} index={datasourceIndex++} />
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};
