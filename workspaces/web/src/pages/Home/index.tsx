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
    <div className="page-container h-screen max-h-screen bg-(--bg)">
      <div className="page-content h-full pb-12 overflow-y-auto">
        <h2 className="font-semibold text-gray-700 mt-4 hidden lg:block">Quick actions</h2>

        {hasUser && !hasDataSources && (
          <Alert variant="warning" className="font-semibold mt-4">
            Connect at least one datasource to start using DataRamen
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-2 mt-4">
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
