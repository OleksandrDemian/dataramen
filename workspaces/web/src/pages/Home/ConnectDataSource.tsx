import clsx from "clsx";
import st from "./index.module.css";
import {useCurrentUser} from "../../data/queries/users.ts";
import {useState} from "react";
import {CreateDatasourceModal} from "../../widgets/AppLayout/components/CreateDatasource";
import {Analytics} from "../../utils/analytics.ts";
import {DataSourceIcon} from "../../widgets/Icons";
import toast from "react-hot-toast";
import {EUserTeamRole} from "@dataramen/types";
import {useRequireRole} from "../../hooks/useRequireRole.ts";

export const ConnectDataSource = () => {
  const { data: user } = useCurrentUser();

  const [showNewDataSource, setShowNewDataSource] = useState<string | undefined>(undefined);
  const isEditor = useRequireRole(EUserTeamRole.EDITOR);

  const onCreateNewDataSource = (dbType: string) => {
    if (isEditor) {
      setShowNewDataSource(dbType);
    } else {
      toast.error("You don't have permission to connect new data sources in this team");
    }

    Analytics.event(`On create new [${dbType}]`);
  };

  return (
    <>
      {showNewDataSource && (
        <CreateDatasourceModal
          show
          dbType={showNewDataSource}
          onClose={() => setShowNewDataSource(undefined)}
        />
      )}

      <button
        disabled={!user}
        className={clsx(st.dataStore, "card-white mt-4")}
        onClick={() => onCreateNewDataSource("postgres")}
      >
        <DataSourceIcon size={32} type="postgres" />
        <DataSourceIcon size={32} type="mysql" />
        <p className="font-semibold truncate text-gray-800">Connect new data source</p>
      </button>
    </>
  );
};
