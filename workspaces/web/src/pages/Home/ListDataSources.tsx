import {DataSourceIcon} from "../../widgets/Icons";
import {useCurrentUser} from "../../data/queries/users.ts";
import {useDataSources} from "../../data/queries/dataSources.ts";
import {setDataSourceModal} from "../../data/dataSourceModalStore.ts";
import {Analytics} from "../../utils/analytics.ts";

const btnStyle = "flex gap-2 items-center cursor-pointer hover:bg-gray-50 bg-white py-3 px-4 rounded-lg border border-gray-200";

export const ListDataSources = () => {
  const { data: user } = useCurrentUser();
  const { data: dataSources } = useDataSources({
    teamId: user?.teamId,
  });

  const onOpen = (id: string) => {
    setDataSourceModal(id);
    Analytics.event("On open datasource [Home]");
  };

  if (!dataSources || dataSources.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-1 mt-2">
      {dataSources?.map((d) => (
        <div key={d.id} className={btnStyle} onClick={() => onOpen(d.id)} tabIndex={0}>
          <DataSourceIcon size={32} type={d.dbType} />
          <p className="font-semibold truncate text-gray-800 flex-1">{d.name}</p>
          {d.allowInsert ? <span className="text-red-700">Development</span> : <span className="text-blue-700">Production</span>}
        </div>
      ))}
    </div>
  );
};
