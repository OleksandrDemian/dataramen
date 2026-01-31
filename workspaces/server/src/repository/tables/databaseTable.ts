import {EntitySchema} from "typeorm";
import {TIMESTAMP_COLUMN_TYPE} from "../../utils/dbUtils";
import {IDatabaseInspectionSchema, IDatabaseTableSchema} from "@dataramen/types";

export const DatabaseTable = new EntitySchema<IDatabaseTableSchema>({
  name: "DatabaseTable",
  tableName: "database_tables",
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
    datasource: {
      target: () => "DataSource",
      type: "many-to-one",
    },
    columns: {
      target: () => "DatabaseColumn",
      type: "one-to-many",
      inverseSide: "table",
    }
  },
});
