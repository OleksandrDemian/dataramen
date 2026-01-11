import st from "./index.module.css";
import {gt, lt} from "../../../utils/numbers.ts";
import {DataSourceIcon} from "../../../widgets/Icons";
import {ContextualMenu} from "../../../widgets/ExplorerView/components/ContextualMenu.tsx";
import {useContextMenuHandler} from "../../../widgets/ExplorerView/components/ContextualMenu.handler.ts";
import {PAGES} from "../../../const/pages.ts";
import {prompt} from "../../../data/promptModalStore.ts";
import {useTeamSavedQueries} from "../../../data/queries/project.ts";
import {useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useDeleteSavedQuery, useUpdateSavedQuery} from "../../../data/queries/queries.ts";
import {useCreateWorkbenchTab} from "../../../data/queries/workbenchTabs.ts";
import {useDebouncedValue} from "../../../hooks/useDebouncedValue.ts";
import {useCurrentUser} from "../../../data/queries/users.ts";

export const SavedQueriesList = () => {
  const { data: user } = useCurrentUser();
  const [nameFilter, setNameFilter] = useState<string>("");
  const debouncedValue = useDebouncedValue(nameFilter);
  const { data: projectQueries, isLoading, fetchNextPage, hasNextPage } = useTeamSavedQueries(user?.teamId, debouncedValue);
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
    <div className={st.queriesContainer}>
      <div className="sticky top-0 p-4 bg-(--bg)">
        <input
          className="input w-full"
          placeholder="Filter"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
      </div>

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
          <p className="text-left">📖 {file.name}</p>
          <p className="flex gap-2 items-center">
            <DataSourceIcon size={20} type={file.datasourceType} />
            <span className="truncate text-sm text-(--text-color-secondary)">{file.datasourceName}</span>
          </p>
        </button>
      ))}

      {hasNextPage && (
        <button
          className="button primary mx-auto mt-4"
          onClick={() => fetchNextPage()}
        >
          Load more
        </button>
      )}

      {!isLoading && lt(projectQueries?.length, 1) && (
        <p className="text-center text-sm text-(--text-color-secondary)">Empty</p>
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
