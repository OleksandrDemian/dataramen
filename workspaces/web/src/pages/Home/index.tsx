import {useDataSources} from "../../data/queries/dataSources.ts";
import {useCurrentUser} from "../../data/queries/users.ts";
import {Alert} from "../../widgets/Alert";
import {StartQuery, ConnectDataSource, WorkbenchTabs, ListDataSources, UsefulLinks} from "./components.tsx";

export const HomePage = () => {
  const {data: user} = useCurrentUser();

  const {data} = useDataSources({
    teamId: user?.teamId,
  });

  const hasDataSources = !!data && data.length > 0;
  const hasUser = !!user;

  return (
    <div className="page-container h-screen max-h-screen">
      <div className="max-w-6xl h-full pb-12 overflow-y-auto">
        <div className="py-10 text-center w-full">
          <h1 className="comfortaa text-3xl font-semibold">DataRamen</h1>
        </div>

        {hasUser && !hasDataSources && (
          <Alert variant="warning" className="font-semibold">
            Connect at least one data source to start using DataRamen
          </Alert>
        )}

        <h2 className="font-semibold text-gray-700 mt-4 hidden lg:block">Quick actions</h2>

        <div className="grid lg:grid-cols-3 gap-2 mt-4">
          <StartQuery />
          <ConnectDataSource />

          {hasUser && (
            <WorkbenchTabs />
          )}
        </div>

        {hasUser && (
          <ListDataSources />
        )}

        <UsefulLinks />
      </div>
    </div>
  );
};
