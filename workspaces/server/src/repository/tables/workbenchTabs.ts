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
      default: () => "CURRENT_TIMESTAMP",
    },
    updatedAt: {
      type: TIMESTAMP_COLUMN_TYPE,
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
    },
    opts: {
      type: "json",
      default: "{}",
    },
    archived: {
      type: Boolean,
      default: false,
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
  },
});
