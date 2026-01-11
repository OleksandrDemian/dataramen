import {updateShowTabsHistory, useShowTabsHistory} from "../../data/showTabsHistorySidebarStore.ts";
import {Sidebar} from "../../widgets/Sidebar";
import {useInfiniteTabHistory} from "../../data/queries/project.ts";
import {useCurrentUser} from "../../data/queries/users.ts";
import {DataSourceIcon} from "../../widgets/Icons";
import {useNavigate} from "react-router-dom";
import {PAGES} from "../../const/pages.ts";
import {useDeleteWorkbenchTab, useRestoreArchivedTab} from "../../data/queries/workbenchTabs.ts";
import {Alert} from "../../widgets/Alert";
import CloseIcon from "../../assets/close-outline.svg?react";
import st from "./index.module.css";
import {useRef} from "react";
import {ContextualMenu, TContextMenuRef} from "../../widgets/ContextualMenu";

const dateFormatter = new Intl.DateTimeFormat();

const Component = () => {
  const { data: user } = useCurrentUser();
  const { data: tabs, fetchNextPage, hasNextPage, isFetching } = useInfiniteTabHistory(user?.teamId, 25);
  const navigate = useNavigate();
  const restoreTab = useRestoreArchivedTab();
  const deleteTab = useDeleteWorkbenchTab();

  const contextActionsRef = useRef<TContextMenuRef>(null);
  const contextItemRef = useRef<string>(null);

  const onOpenTab = (id: string) => {
    restoreTab.mutate(id);
    updateShowTabsHistory({ show: false });
    navigate(PAGES.workbenchTab.build({ id }));
  };

  const onDelete = () => {
    contextActionsRef.current?.close();
    deleteTab.mutate(contextItemRef.current!);
  };

  const hasTabs = tabs && tabs?.length > 0;

  return (
    <div className={st.container}>
      <div className={st.header}>
        <h3 className="text-lg">Recent tabs</h3>
        <button className={st.closeButton} onClick={() => updateShowTabsHistory({ show: false })}>
          <CloseIcon width={24} height={24} />
        </button>
      </div>

      {!hasTabs && (
        <Alert variant="warning">History is empty.</Alert>
      )}

      {tabs?.map((tab) => (
        <div
          className={st.tabContainer}
          key={tab.id}
          onClick={() => onOpenTab(tab.id)}
          onContextMenu={(e) => {
            contextItemRef.current = tab.id;
            contextActionsRef.current?.open(e, false);
          }}
        >
          <div className="flex gap-2 items-center">
            <p className={st.tabName}>{tab.name}</p>
            {tab.dataSourceType && (
              <DataSourceIcon size={16} type={tab.dataSourceType} />
            )}
            <p className="text-xs text-(--text-color-secondary)">{tab.dataSourceName}</p>
          </div>
          <div className="flex gap-2 items-center mt-1">
            <p className="text-xs text-(--text-color-secondary) italic">{dateFormatter.format(new Date(tab.updatedAt))}</p>
            {tab.archived ? (
              <span className={st.archivedBadge}>Archived</span>
            ) : (
              <span className={st.activeBadge}>Active</span>
            )}
          </div>
        </div>
      ))}

      <ContextualMenu ref={contextActionsRef}>
        <button onClick={onDelete} className={st.deleteAction}>
          🗑 Delete
        </button>
      </ContextualMenu>

      {hasNextPage && !isFetching && (
        <div className="flex justify-center my-2">
          <button className={st.loadMoreBtn} onClick={() => fetchNextPage()}>Load more</button>
        </div>
      )}
    </div>
  );
};

export const TabsHistorySidebar = () => {
  const show = useShowTabsHistory((s) => s.show);

  return (
    <Sidebar isVisible={show} onClose={() => updateShowTabsHistory({ show: false })} backdropClose>
      <Component />
    </Sidebar>
  );
};
