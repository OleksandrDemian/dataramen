import {useDataSources} from "../../data/queries/dataSources.ts";
import {useCurrentUser} from "../../data/queries/users.ts";
import {Alert} from "../../widgets/Alert";
import {
  StartQuery,
  ConnectDataSource,
  WorkbenchTabs,
  ListDataSources,
  UsefulLinks,
  RecentTabs,
  SavedQueriesAction
} from "./components.tsx";
import st from "./index.module.css";

export const HomePage = () => {
  const {data: user} = useCurrentUser();

  const {data} = useDataSources({
    teamId: user?.teamId,
  });

  const hasDataSources = !!data && data.length > 0;
  const hasUser = !!user;

  return (
    <div className="page-container h-screen max-h-screen overflow-y-auto no-scrollbar">
      <div className="page-content">
        <div className="py-10 text-center w-full sticky top-0 z-0">
          <h1 className="comfortaa text-3xl font-semibold text-(--text-color-primary) mb-4">DataRamen</h1>

          <UsefulLinks />
        </div>

        <div className="flex flex-col gap-8 mt-8 bg-(--bg) z-1">
          {hasUser && !hasDataSources && (
            <Alert variant="warning" className="font-semibold">
              Connect at least one data source to start using DataRamen
            </Alert>
          )}

          <div className={st.homeGrayCard}>
            <h2 className={st.homeCardTitle}>Quick actions</h2>

            <div className={st.homeCardGridContent}>
              <StartQuery />
              <ConnectDataSource />

              {hasUser && (
                <WorkbenchTabs />
              )}

              <SavedQueriesAction />
            </div>
          </div>

          {hasUser && (
            <ListDataSources />
          )}

          <RecentTabs />
        </div>
      </div>
    </div>
  );
};
