export const TIMESTAMP_COLUMN_TYPE = process.env.APP_DB_TYPE === "sqlite" ? "datetime" : "timestamp";
export const Tables = {
  WorkbenchTabs: "workbench_tabs",
  Teams: "teams",
  Users: "users",
  UsersToTeams: "users_to_teams",
  UserSettings: "user_settings",
  DataSources: "data_sources",
  Query: "query",
  DbInspection: "db_inspection",
  SavedQueries: "saved_queries",
};
