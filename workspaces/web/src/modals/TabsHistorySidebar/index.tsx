import {updateShowTabsHistory, useShowTabsHistory} from "../../data/showTabsHistorySidebarStore.ts";
import {Sidebar} from "../../widgets/Sidebar";
import {useInfiniteTabHistory} from "../../data/queries/project.ts";
import {useCurrentUser} from "../../data/queries/users.ts";
import {DataSourceIcon} from "../../widgets/Icons";
import {useNavigate} from "react-router-dom";
import {PAGES} from "../../const/pages.ts";
import {useDeleteWorkbenchTab, useRestoreArchivedTab} from "../../data/queries/workbenchTabs.ts";
import {Alert} from "../../widgets/Alert";

const dateFormatter = new Intl.DateTimeFormat();

const Component = () => {
  const { data: user } = useCurrentUser();
  const { data: tabs, fetchNextPage, hasNextPage, isFetching } = useInfiniteTabHistory(user?.teamId);
  const navigate = useNavigate();
  const restoreTab = useRestoreArchivedTab();
  const deleteTab = useDeleteWorkbenchTab();

  const onOpenTab = (id: string) => {
    restoreTab.mutate(id);
    updateShowTabsHistory({ show: false });
    navigate(`${PAGES.workbench.path}/tab/${id}`);
  };

  const onDeleteTab = (id: string) => {
    deleteTab.mutate(id);
  };

  const hasTabs = tabs && tabs?.length > 0;

  return (
    <div className="w-full lg:w-md flex flex-col">
      {!hasTabs && (
        <Alert variant="warning">History is empty.</Alert>
      )}

      {tabs?.map((tab) => (
        <div className="p-4 border-b border-gray-200" key={tab.id}>
          <div className="flex gap-2 items-center">
            <p className="text-sm font-semibold flex-1 truncate">{tab.name}</p>
            {tab.dataSourceType && (
              <DataSourceIcon size={16} type={tab.dataSourceType} />
            )}
            <p className="text-sm">{tab.dataSourceName}</p>
          </div>
          <div className="flex gap-2 items-center mt-1">
            <p className="text-sm italic">{dateFormatter.format(new Date(tab.updatedAt))}</p>
            {tab.archived ? (
              <span className="rounded-md bg-yellow-50 text-sm border border-yellow-200 px-2 text-yellow-800">Archived</span>
            ) : (
              <span className="rounded-md bg-green-50 text-sm border border-green-200 px-2 text-green-800">Active</span>
            )}
            <span className="flex-1" />

            <button onClick={() => onOpenTab(tab.id)} className="text-sm text-blue-800 hover:underline cursor-pointer">Open</button>
            <button onClick={() => onDeleteTab(tab.id)} className="text-sm text-red-800 hover:underline cursor-pointer">Delete</button>
          </div>
        </div>
      ))}

      {hasNextPage && !isFetching && (
        <div className="flex justify-center mt-4">
          <button className="button text-blue-800 text-sm" onClick={() => fetchNextPage()}>Load more</button>
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
