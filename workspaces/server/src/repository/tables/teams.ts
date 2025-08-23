import { EntitySchema } from "typeorm";
import {TIMESTAMP_COLUMN_TYPE} from "../../utils/dbUtils";
import {ITeamSchema} from "@dataramen/types";

export const Team = new EntitySchema<ITeamSchema>({
  name: "Team",
  tableName: "teams",
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
    },
  },
  relations: {
    users: {
      type: "one-to-many",
      target: () => "UsersToTeams",
      inverseSide: "team",
    },
    queries: {
      type: "one-to-many",
      target: () => "Query",
      inverseSide: "team",
    },
    datasources: {
      type: "one-to-many",
      target: () => "DataSource",
      inverseSide: "team",
    },
  },
});
