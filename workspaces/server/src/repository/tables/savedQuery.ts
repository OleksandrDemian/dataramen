import { EntitySchema } from "typeorm";
import { TIMESTAMP_COLUMN_TYPE } from "../../utils/dbUtils";
import { ISavedQuerySchema } from "@dataramen/types";

export const SavedQuery = new EntitySchema<ISavedQuerySchema>({
  name: "SavedQuery",
  tableName: "saved_queries",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    isPersonal: {
      type: Boolean,
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
    user: {
      type: "many-to-one",
      target: () => "User",
      inverseSide: "queries",
      joinColumn: true,
      nullable: true,
    },
    query: {
      type: "one-to-one",
      target: () => "Query",
      joinColumn: true,
      nullable: false,
    },
  },
});
