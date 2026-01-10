import {useCurrentUser} from "../../../../data/queries/users.ts";
import st from "./index.module.css";
import stNav from "../../Nav/index.module.css";
import {useTeamDataSources} from "../../../../data/queries/project.ts";
import {setDataSourceModal} from "../../../../data/dataSourceModalStore.ts";
import {Analytics} from "../../../../utils/analytics.ts";
import { TProjectDataSource } from "@dataramen/types";
import {DataSourceIcon} from "../../../Icons";
import {gt} from "../../../../utils/numbers.ts";
import {useHotkeys} from "react-hotkeys-hook";

const Datasource = ({ dataSource, index }: { dataSource: TProjectDataSource, index: number }) => {
  const onOpen = () => {
    setDataSourceModal(dataSource.id);
    Analytics.event("On open datasource [Sidebar]");
  };

  useHotkeys(index.toString(), () => {
    setDataSourceModal((cur) => {
      if (cur === dataSource.id) return undefined;
      return dataSource.id;
    });
    Analytics.event("On open datasource [Hotkey]");
  });

  return (
    <button className={stNav.navItem} onClick={onOpen}>
      <span className={stNav.icon}>
        <DataSourceIcon size={20} type={dataSource.dbType} />
      </span>
      <span className="truncate">{dataSource.name}</span>
      <span className="hotkey secondary">{index}</span>
    </button>
  );
};

export const ProjectStructure = () => {
  const { data: user } = useCurrentUser();
  const { data: projectDataSources } = useTeamDataSources(user?.teamId);

  return (
    <div className={st.container}>
      {gt(projectDataSources?.length, 0) && (
        <div className="mt-4 flex flex-col">
          <p className="font-semibold truncate text-(--text-color-secondary) mb-2">Data sources</p>
          {projectDataSources.map((dataSource, index) => (
            <Datasource dataSource={dataSource} key={dataSource.id} index={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
