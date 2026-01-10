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

const dateFormatter = new Intl.DateTimeFormat();

const Component = () => {
  const { data: user } = useCurrentUser();
  const { data: tabs, fetchNextPage, hasNextPage, isFetching } = useInfiniteTabHistory(user?.teamId, 25);
  const navigate = useNavigate();
  const restoreTab = useRestoreArchivedTab();
  const deleteTab = useDeleteWorkbenchTab();

  const onOpenTab = (id: string) => {
    restoreTab.mutate(id);
    updateShowTabsHistory({ show: false });
    navigate(PAGES.workbenchTab.build({ id }));
  };

  const onDeleteTab = (id: string) => {
    deleteTab.mutate(id);
  };

  const hasTabs = tabs && tabs?.length > 0;

  return (
    <div className={st.container}>
      <div className={st.header}>
        <h3 className="text-lg">Tabs history</h3>
        <button className={st.closeButton} onClick={() => updateShowTabsHistory({ show: false })}>
          <CloseIcon width={24} height={24} />
        </button>
      </div>

      {!hasTabs && (
        <Alert variant="warning">History is empty.</Alert>
      )}

      {tabs?.map((tab) => (
        <div className={st.tabContainer} key={tab.id}>
          <div className="flex gap-2 items-center">
            <p className={st.tabName}>{tab.name}</p>
            {tab.dataSourceType && (
              <DataSourceIcon size={16} type={tab.dataSourceType} />
            )}
            <p className="text-sm">{tab.dataSourceName}</p>
          </div>
          <div className="flex gap-2 items-center mt-1">
            <p className="text-sm italic">{dateFormatter.format(new Date(tab.updatedAt))}</p>
            {tab.archived ? (
              <span className={st.archivedBadge}>Archived</span>
            ) : (
              <span className={st.activeBadge}>Active</span>
            )}
            <span className="flex-1" />

            <button onClick={() => onOpenTab(tab.id)} className={st.actionBlue}>Open</button>
            <button onClick={() => onDeleteTab(tab.id)} className={st.actionRed}>Delete</button>
          </div>
        </div>
      ))}

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
