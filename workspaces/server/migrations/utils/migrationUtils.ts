import {TableColumnOptions} from "typeorm";

export const TIMESTAMP_COLUMN_TYPE = process.env.APP_DB_TYPE === "sqlite" ? "datetime" : "timestamp";
export const Tables = {
  WorkbenchTabs: "workbench_tabs",
  Teams: "teams",
  Users: "users",
  UsersToTeams: "users_to_teams",
  UserSettings: "user_settings",
  DataSources: "data_sources",
  Query: "query",
  SavedQueries: "saved_queries",
  DatabaseColumn: "database_columns",
  DatabaseTable: "database_tables",
};
export const UUIDColumn = (opts: Partial<TableColumnOptions> = {}): TableColumnOptions => {
  const isMysql = process.env.APP_DB_TYPE === "mysql";

  return {
    name: "id",
    type: isMysql ? "char" : "uuid",
    length: isMysql ? '36' : undefined,
    isPrimary: true,
    ...opts,
  }
};

export const UUIDColumnRef = (name: string, opts: Partial<TableColumnOptions> = {}): TableColumnOptions => {
  const isMysql = process.env.APP_DB_TYPE === "mysql";

  return {
    name,
    type: isMysql ? "char" : "uuid",
    length: isMysql ? '36' : undefined,
    ...opts,
  };
};