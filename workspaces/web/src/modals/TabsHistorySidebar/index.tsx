import {updateShowTabsHistory, useShowTabsHistory} from "../../data/sidebarDispatchersStore.ts";
import {Sidebar} from "../../widgets/Sidebar";
import {useInfiniteTabHistory} from "../../data/queries/project.ts";
import {useCurrentUser} from "../../data/queries/users.ts";
import {DataSourceIcon} from "../../widgets/Icons";
import {useNavigate} from "react-router-dom";
import {PAGES} from "../../const/pages.ts";
import {useDeleteWorkbenchTab, useRestoreArchivedTab} from "../../data/queries/workbenchTabs.ts";
import st from "./index.module.css";
import {useRef, useState} from "react";
import {ContextualMenu, TContextMenuRef} from "../../widgets/ContextualMenu";
import {SidebarListContainer} from "../../widgets/SidebarListContainer";
import {useDebouncedValue} from "../../hooks/useDebouncedValue.ts";

const dateFormatter = new Intl.DateTimeFormat();

const Component = () => {
  const [filter, setFilter] = useState<string>("");
  const debouncedValue = useDebouncedValue(filter);
  const { data: user } = useCurrentUser();
  const { data: tabs, fetchNextPage, hasNextPage } = useInfiniteTabHistory(user?.teamId, debouncedValue, 25);
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

  return (
    <SidebarListContainer
      hasMore={hasNextPage}
      onLoadMore={fetchNextPage}
      onClose={() => updateShowTabsHistory({ show: false })}
      searchValue={filter}
      onSearchValue={setFilter}
    >
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
    </SidebarListContainer>
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
