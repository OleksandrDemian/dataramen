import {EntitySchema} from "typeorm";
import {TIMESTAMP_COLUMN_TYPE} from "../../utils/dbUtils";
import {IDatabaseInspectionSchema} from "@dataramen/types";

export const DatabaseInspection = new EntitySchema<IDatabaseInspectionSchema>({
  name: "DatabaseInspection",
  tableName: "db_inspection",
  columns: {
    id: {
      type: String,
      unique: true,
      primary: true,
      generated: "uuid",
    },
    tableName: {
      nullable: true,
      type: String,
    },
    columns: {
      type: "json",
      nullable: true,
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
      joinTable: false,
      cascade: true,
    },
  },
});
