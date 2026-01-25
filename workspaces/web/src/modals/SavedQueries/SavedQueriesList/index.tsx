import st from "./index.module.css";
import {gt, lt} from "../../../utils/numbers.ts";
import {DataSourceIcon} from "../../../widgets/Icons";
import {ContextualMenu} from "../../../widgets/ExplorerView/components/ContextualMenu.tsx";
import {useContextMenuHandler} from "../../../widgets/ExplorerView/components/ContextualMenu.handler.ts";
import {PAGES} from "../../../const/pages.ts";
import {prompt} from "../../../data/promptModalStore.ts";
import {useRef} from "react";
import {useNavigate} from "react-router-dom";
import {useDeleteSavedQuery, useUpdateSavedQuery} from "../../../data/queries/queries.ts";
import {useCreateWorkbenchTab} from "../../../data/queries/workbenchTabs.ts";
import { TProjectQuery } from "@dataramen/types";
import {updateShowSavedQueries} from "../../../data/sidebarDispatchersStore.ts";

const dateFormatter = new Intl.DateTimeFormat();

export const SavedQueriesList = ({ projectQueries, isLoading }: { isLoading: boolean; projectQueries: TProjectQuery[] }) => {
  const contextQueryId = useRef<string | undefined>(undefined);

  const navigate = useNavigate();
  const updateQuery = useUpdateSavedQuery();
  const createWorkbenchTab = useCreateWorkbenchTab();
  const deleteSavedQuery = useDeleteSavedQuery();
  const contextHandler = useContextMenuHandler();

  const openQuery = (queryId: string) => {
    createWorkbenchTab.mutateAsync({
      queryId,
    }).then((result) => {
      updateShowSavedQueries({ show: false });
      navigate(PAGES.workbenchTab.build({ id: result.id }));
    });
  };

  const updateQueryName = async (queryId: string) => {
    const current = projectQueries?.find((query) => query.id === queryId);
    if (!current) return;

    const name = await prompt("New name?", current?.name);
    if (name) {
      updateQuery.mutate({
        id: current.savedQueryId,
        payload: {
          name,
        },
      });
    }
  };

  const deleteQuery = (queryId: string) => {
    const savedQueryId = projectQueries?.find(
      (query) => query.id === queryId,
    )?.savedQueryId;

    if (savedQueryId) {
      deleteSavedQuery.mutate(savedQueryId);
    }
  };

  return (
    <div className="flex flex-col px-2">
      {gt(projectQueries?.length, 0) && projectQueries.map((file) => (
        <button
          key={file.savedQueryId}
          className={st.queryEntry}
          onClick={() => openQuery(file.id)}
          onContextMenu={(e) => {
            contextQueryId.current = file.id;
            contextHandler.open(e);
          }}
        >
          <div>
            <p className="text-left text-sm font-semibold text-(--text-color-primary)">{file.name}</p>
            <p className="text-left text-xs text-(--text-color-secondary) italic">{dateFormatter.format(new Date(file.updatedAt))}</p>
          </div>

          <p className="flex gap-2 items-center">
            <DataSourceIcon size={16} type={file.datasourceType} />
            <span className="truncate text-xs text-(--text-color-secondary)">{file.datasourceName}</span>
          </p>
        </button>
      ))}

      {!isLoading && lt(projectQueries?.length, 1) && (
        <p className="text-center text-sm text-(--text-color-secondary) mt-2">Empty</p>
      )}

      <ContextualMenu handler={contextHandler}>
        <div className="context-menu-container">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              contextHandler.close();
              updateQueryName(contextQueryId.current!);
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
              deleteQuery(contextQueryId.current!);
            }}
            className="context-menu-item"
          >
            🗑️ Delete
          </button>
        </div>
      </ContextualMenu>
    </div>
  );
};
