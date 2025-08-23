import {useDataSources} from "../../data/queries/dataSources.ts";
import {useCurrentUser} from "../../data/queries/users.ts";
import {useOpenTabs} from "../../data/openTabsStore.ts";
import {Alert} from "../../widgets/Alert";
import {WorkbenchTabs} from "./WorkbenchTabs.tsx";
import {StartQuery} from "./components.tsx";
import {ConnectDataSource} from "./ConnectDataSource.tsx";
import {ConnectionInstructions} from "./ConnectionInstructions.tsx";
import {useLocalServerStatus} from "../../data/queries/localServerStatus.ts";
import {ListDataSources} from "./ListDataSources.tsx";

export const HomePage = () => {
  const {data: user} = useCurrentUser();
  const openTabs = useOpenTabs();
  const { data: localServer } = useLocalServerStatus();

  const {data} = useDataSources({
    teamId: user?.teamId,
  });

  const hasDataSources = !!data && data.length > 0;
  const hasUser = !!user;
  const showConnectionInstructions = localServer?.active === false;

  if (!localServer) {
    return null;
  }

  if (showConnectionInstructions) {
    return (
      <div className="page-container h-screen max-h-screen overflow-y-auto bg-(--bg)">
        <div className="page-content">
          <ConnectionInstructions />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container h-screen max-h-screen overflow-y-auto bg-(--bg)">
      <div className="page-content h-full">
        {hasUser && !hasDataSources && (
          <Alert variant="warning" className="mb-2 font-semibold">
            Connect at least one datasource to start using DataRamen
          </Alert>
        )}

        {hasDataSources && (
          <StartQuery />
        )}

        {hasUser && openTabs.length > 0 && (
          <WorkbenchTabs />
        )}

        {hasUser && [
          <ConnectDataSource key="connect-datasource" />,
          <ListDataSources key="list-datasources" />
        ]}
      </div>
    </div>
  );
};
