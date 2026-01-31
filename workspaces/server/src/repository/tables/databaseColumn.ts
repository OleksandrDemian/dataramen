import {EntitySchema} from "typeorm";
import {TIMESTAMP_COLUMN_TYPE} from "../../utils/dbUtils";
import { IDatabaseColumnSchema } from "@dataramen/types";

export const DatabaseColumn = new EntitySchema<IDatabaseColumnSchema>({
  name: "DatabaseColumn",
  tableName: "database_columns",
  columns: {
    id: {
      type: String,
      unique: true,
      primary: true,
      generated: "uuid",
    },
    name: {
      nullable: true,
      type: String,
    },
    type: {
      type: String,
    },
    isPrimary: {
      type: Boolean,
    },
    createdAt: {
      type: TIMESTAMP_COLUMN_TYPE,
      createDate: true,
    },
    updatedAt: {
      type: TIMESTAMP_COLUMN_TYPE,
      updateDate: true,
    },
    meta: {
      type: "json",
      nullable: true,
    },
  },
  relations: {
    table: {
      target: () => "DatabaseTable",
      type: "many-to-one",
      inverseSide: "columns",
    },
  },
});