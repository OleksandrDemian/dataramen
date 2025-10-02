import {TQueryOptions} from "./queries";
import {EUserTeamRole} from "./users";

export interface IUser {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  username: string;
  password: string;
}

export interface IUserSchema extends IUser {
  teams: IUsersToTeamsSchema[];
  settings: IUserSettings;
  currentTeam: IUsersToTeamsSchema;
  queries: IQuerySchema;
}

export interface InspectionColumn {
  name: string;
  type: string;
  isPrimary?: boolean;
  ref?: {
    table: string;
    field: string;
  };
}

export interface IDatabaseInspection {
  id: string;
  tableName: string;
  columns: InspectionColumn[] | null; // json
  createdAt: Date;
  updatedAt: Date;
}

export interface IDatabaseInspectionSchema extends IDatabaseInspection {
  datasource: IDataSourceSchema;
}

export interface IDataSource {
  id: string;
  dbUrl: string;
  dbPort?: number;
  dbUser: string;
  dbPassword?: string;
  dbPasswordIv?: string;
  dbPasswordTag?: string;
  dbType: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description?: string;
  dbDatabase: string;
  dbSchema?: string;
  allowInsert: boolean;
  allowUpdate: boolean;
  lastInspected?: Date;
  status: null | "READY" | "INSPECTING";
}

export interface IDataSourceSchema extends IDataSource {
  team: ITeamSchema;
  inspections: IDatabaseInspectionSchema[];
  queries: IQuery[];
  owner: IUserSchema;
}

export interface IQuery {
  id: string;
  name: string;
  opts: Partial<TQueryOptions>;
  isPersonal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuerySchema extends IQuery {
  team: ITeamSchema;
  dataSource: IDataSourceSchema;
  user: IUserSchema;
}

export interface ISavedQuery {
  id: string;
  isPersonal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISavedQuerySchema extends ISavedQuery {
  user: IUserSchema;
  team: ITeamSchema;
  query: IQuerySchema;
}

export interface ITeam {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeamSchema extends ITeam {
  users: IUsersToTeamsSchema[];
  queries: IQuerySchema[];
  datasources: IDataSourceSchema[];
}

export interface IUserSettings {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserSettingsSchema extends IUserSettings {
  user: IUserSchema;
}

export interface IUsersToTeams {
  id: string;
  role: EUserTeamRole;
}

export interface IUsersToTeamsSchema extends IUsersToTeams {
  user: IUserSchema;
  team: ITeamSchema;
}