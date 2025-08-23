import { EntitySchema } from "typeorm";
import {TIMESTAMP_COLUMN_TYPE} from "../../utils/dbUtils";
import {IQuerySchema} from "@dataramen/types";

export const Query = new EntitySchema<IQuerySchema>({
  name: "Query",
  tableName: "query",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    name: {
      type: String,
    },
    opts: {
      type: "json",
      default: "{}",
    },
    isTrash: {
      type: Boolean,
      default: false,
      nullable: true,
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
  },
  relations: {
    team: {
      type: "many-to-one",
      target: () => "Team",
      inverseSide: "queries",
      joinColumn: true,
    },
    dataSource: {
      type: "many-to-one",
      target: () => "DataSource",
      inverseSide: "datasources",
      joinColumn: true,
    },
  },
});
