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
    createdAt: {
      type: TIMESTAMP_COLUMN_TYPE,
      createDate: true,
    },
    updatedAt: {
      type: TIMESTAMP_COLUMN_TYPE,
      updateDate: true,
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
    user: {
      type: "many-to-one",
      target: () => "User",
      inverseSide: "queries",
      joinColumn: true,
      nullable: true,
    },
  },
});
