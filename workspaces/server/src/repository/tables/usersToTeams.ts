import { EntitySchema } from "typeorm";
import {IUsersToTeamsSchema} from "@dataramen/types";

export const UsersToTeams = new EntitySchema<IUsersToTeamsSchema>({
  name: "UsersToTeams",
  tableName: "users_to_teams",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    role: {
      type: "varchar",
      default: "admin",
      nullable: false,
    }
  },
  relations: {
    team: {
      type: "many-to-one",
      target: () => "Team",
      inverseSide: "users",
    },
    user: {
      type: "many-to-one",
      target: () => "User",
      inverseSide: "teams",
    }
  },
});
