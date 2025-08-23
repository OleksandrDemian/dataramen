import { EntitySchema } from "typeorm";
import {TIMESTAMP_COLUMN_TYPE} from "../../utils/dbUtils";
import {IUserSettingsSchema} from "@dataramen/types";

export const UserSettings = new EntitySchema<IUserSettingsSchema>({
  name: "UserSettings",
  tableName: "user_settings",
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
  },
  relations: {
    user: {
      type: "one-to-one",
      target: () => "User",
      inverseSide: "settings",
      joinColumn: true,
    },
  },
});
