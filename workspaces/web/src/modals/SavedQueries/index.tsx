import {useTeamSavedQueries} from "../../data/queries/project.ts";
import {useCurrentUser} from "../../data/queries/users.ts";
import {SavedQueriesList} from "./SavedQueriesList";
import { updateShowSavedQueries, useShowSavedQueries } from "../../data/sidebarDispatchersStore.ts";
import {Sidebar} from "../../widgets/Sidebar";
import {SidebarListContainer} from "../../widgets/SidebarListContainer";
import {useState} from "react";
import {useDebouncedValue} from "../../hooks/useDebouncedValue.ts";

const Component = () => {
  const { data: user } = useCurrentUser();
  const [nameFilter, setNameFilter] = useState<string>("");
  const debouncedValue = useDebouncedValue(nameFilter);
  const {
    data: projectQueries,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useTeamSavedQueries(user?.teamId, debouncedValue);

  return (
    <SidebarListContainer
      hasMore={hasNextPage}
      onClose={() => updateShowSavedQueries({ show: false })}
      onLoadMore={fetchNextPage}
      searchValue={nameFilter}
      onSearchValue={setNameFilter}
    >
      <SavedQueriesList isLoading={isLoading} projectQueries={projectQueries || []} />
    </SidebarListContainer>
  );
};

export const SavedQueriesSidebar = () => {
  const show = useShowSavedQueries((s) => s.show);

  return (
    <Sidebar isVisible={show} onClose={() => updateShowSavedQueries({ show: false })} backdropClose>
      <Component />
    </Sidebar>
  );
};
