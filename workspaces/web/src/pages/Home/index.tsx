import {useDataSources} from "../../data/queries/dataSources.ts";
import {useCurrentUser} from "../../data/queries/users.ts";
import {useOpenTabs} from "../../data/openTabsStore.ts";
import {Alert} from "../../widgets/Alert";
import {StartQuery, ConnectDataSource, WorkbenchTabs, ListDataSources} from "./components.tsx";

export const HomePage = () => {
  const {data: user} = useCurrentUser();
  const openTabs = useOpenTabs();

  const {data} = useDataSources({
    teamId: user?.teamId,
  });

  const hasDataSources = !!data && data.length > 0;
  const hasUser = !!user;

  return (
    <div className="page-container h-screen max-h-screen overflow-y-auto bg-(--bg)">
      <div className="page-content h-full">

        <h2 className="text-6xl font-semibold text-gray-700 text-center lg:text-left mt-6 lg:mt-0">DataRamen</h2>

        {hasUser && !hasDataSources && (
          <Alert variant="warning" className="font-semibold mt-8">
            Connect at least one datasource to start using DataRamen
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-2 mt-8">
          {hasDataSources && (
            <StartQuery />
          )}

          {hasUser && openTabs.length > 0 && (
            <WorkbenchTabs />
          )}

          <ConnectDataSource key="connect-datasource" />
        </div>

        {hasUser && (
          <ListDataSources />
        )}
      </div>
    </div>
  );
};
