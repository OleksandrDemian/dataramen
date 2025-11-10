import { DataSource as TypeOrm } from "typeorm"
import { DatabaseInspection } from "./tables/databaseInspection";
import { Team } from "./tables/teams";
import { User } from "./tables/users";
import { UserSettings } from "./tables/userSettings";
import { DataSource } from "./tables/datasource";
import os from 'node:os';
import { posix } from 'node:path';
import {Query} from "./tables/query";
import {Env} from "../services/env";
import {UsersToTeams} from "./tables/usersToTeams";
import {SavedQuery} from "./tables/savedQuery";
import {WorkbenchTab} from "./tables/workbenchTabs";

function getDatabaseValue (): string {
  let value = Env.str("APP_DB_DATABASE");
  if (!value) {
    throw new Error("Bad value for TYPEORM_DATABASE. Please check your config!");
  }

  if (value.startsWith("<home>")) {
    value = value.replace("<home>", os.homedir());
  }
  return value;
}

export const AppDataSource = new TypeOrm({
  type: Env.str("APP_DB_TYPE") as any,
  database: getDatabaseValue(),
  host: Env.str("APP_DB_HOST"),
  username: Env.str("APP_DB_USERNAME"),
  password: Env.str("APP_DB_PASSWORD"),
  port: Env.num("APP_DB_PORT"),
  schema: Env.str("APP_DB_SCHEMA"),
  logging: true, // Env.bool("APP_DB_LOGGING"),
  migrationsRun: true, // for now run migration by default
  migrations: [posix.join(__dirname, "migrations", "*.js")],
  entities: [
    DatabaseInspection,
    DataSource,
    Team,
    User,
    UsersToTeams,
    UserSettings,
    Query,
    SavedQuery,
    WorkbenchTab,
  ],
});

export const init = async () => {
  if (!AppDataSource.isInitialized) {
    return AppDataSource.initialize();
  }

  throw new Error("Already initialized");
};

export const DatabaseInspectionRepository = AppDataSource.getRepository(DatabaseInspection);
export const DataSourceRepository = AppDataSource.getRepository(DataSource);
export const TeamRepository = AppDataSource.getRepository(Team);
export const UserRepository = AppDataSource.getRepository(User);
export const UsersToTeamsRepository = AppDataSource.getRepository(UsersToTeams);
export const UserSettingsRepository = AppDataSource.getRepository(UserSettings);
export const QueriesRepository = AppDataSource.getRepository(Query);
export const SavedQueriesRepository = AppDataSource.getRepository(SavedQuery);
export const WorkbenchTabsRepository = AppDataSource.getRepository(WorkbenchTab);
