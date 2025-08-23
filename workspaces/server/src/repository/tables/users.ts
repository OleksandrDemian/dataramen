import { EntitySchema } from "typeorm";
import {TIMESTAMP_COLUMN_TYPE} from "../../utils/dbUtils";
import {IUserSchema} from "@dataramen/types";

export const User = new EntitySchema<IUserSchema>({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    createdAt: {
      type: TIMESTAMP_COLUMN_TYPE,
      default: () => "CURRENT_TIMESTAMP",
    },
    updatedAt: {
      type: TIMESTAMP_COLUMN_TYPE,
      default: () => "CURRENT_TIMESTAMP",
    },
    username: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    }
  },
  relations: {
    teams: {
      type: "one-to-many",
      target: () => "UsersToTeams",
      inverseSide: "user",
    },
    settings: {
      type: "one-to-one",
      target: () => "UserSettings",
      inverseSide: "user",
    },
    currentTeam: {
      type: "one-to-one",
      target: () => "UsersToTeams",
      inverseSide: "user",
      joinColumn: true
    },
  },
});
