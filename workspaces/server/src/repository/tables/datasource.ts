import { EntitySchema } from "typeorm";
import {TIMESTAMP_COLUMN_TYPE} from "../../utils/dbUtils";
import {IDataSourceSchema} from "@dataramen/types";

export const DataSource = new EntitySchema<IDataSourceSchema>({
  name: "DataSource",
  tableName: "data_sources",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    dbUrl: {
      type: String,
    },
    dbPort: {
      type: Number,
      nullable: true,
    },
    dbUser: {
      type: String,
    },
    dbPassword: {
      type: String,
      nullable: true,
      select: false,
    },
    dbPasswordIv: {
      type: String,
      nullable: true,
      select: false,
    },
    dbPasswordTag: {
      type: String,
      nullable: true,
      select: false,
    },
    dbType: {
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
    name: {
      type: String,
    },
    description: {
      type: String,
      nullable: true,
    },
    dbDatabase: {
      type: String,
    },
    dbSchema: {
      type: String,
      nullable: true,
    },
    allowInsert: {
      type: Boolean,
      default: false,
    },
    allowUpdate: {
      type: Boolean,
      default: false,
    },
    lastInspected: {
      type: TIMESTAMP_COLUMN_TYPE,
      nullable: true,
      default: null,
    },
    status: {
      type: String,
      nullable: true,
    },
  },
  relations: {
    team: {
      type: "many-to-one",
      target: () => "Team",
      inverseSide: "datasources",
      joinColumn: true,
    },
    queries: {
      type: "one-to-many",
      target: () => "Query",
      inverseSide: "dataSource",
    },
    owner: {
      type: "many-to-one",
      target: () => "User",
      joinColumn: true,
    },
  },
});
