import { EntitySchema } from "typeorm";
import {TIMESTAMP_COLUMN_TYPE} from "../../utils/dbUtils";
import {IWorkbenchTabSchema} from "@dataramen/types";

export const WorkbenchTab = new EntitySchema<IWorkbenchTabSchema>({
  name: "WorkbenchTab",
  tableName: "workbench_tabs",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    name: {
      type: String,
    },
    createdAt: {
      type: TIMESTAMP_COLUMN_TYPE,
      createDate: true,
    },
    updatedAt: {
      type: TIMESTAMP_COLUMN_TYPE,
      updateDate: true,
    },
    opts: {
      type: "json",
      nullable: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    searchString: {
      type: String,
      default: () => null,
    },
  },
  relations: {
    team: {
      type: "many-to-one",
      target: () => "Team",
      joinColumn: true,
    },
    user: {
      type: "many-to-one",
      target: () => "User",
      joinColumn: true,
    },
    dataSource: {
      type: "many-to-one",
      target: () => "DataSource",
      joinColumn: true,
    },
  },
});
