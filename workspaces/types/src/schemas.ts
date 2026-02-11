import {TQueryOptions} from "./queries";
import {EUserTeamRole} from "./users";
import {TWorkbenchOptions} from "./workbenchTabs";
import {TDatabaseDialect} from "./dialect";

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

export interface IInspectionColumnRef {
  table: string;
  field: string;
}

export interface InspectionColumn {
  name: string;
  type: string;
  isPrimary?: boolean;
  ref?: IInspectionColumnRef;
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

export interface IDatabaseTable {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDatabaseTableSchema extends IDatabaseTable {
  datasource: IDataSourceSchema;
  columns: IDatabaseColumnSchema[];
}

export interface IDatabaseColumnMeta {
  refs?: IInspectionColumnRef;
  referencedBy?: IInspectionColumnRef[];
}

export interface IDatabaseColumn {
  id: string;
  name: string;
  type: string;
  isPrimary?: boolean;
  createdAt: Date;
  updatedAt: Date;
  meta?: IDatabaseColumnMeta;
  tableId: string;
}

export interface IDatabaseColumnSchema extends IDatabaseColumn {
  table: IDatabaseTableSchema;
}

export interface IDataSource {
  id: string;
  dbUrl: string;
  dbPort?: number;
  dbUser: string;
  dbPassword?: string;
  dbPasswordIv?: string;
  dbPasswordTag?: string;
  dbType: TDatabaseDialect;
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
  queries: IQuery[];
  owner: IUserSchema;
}

export interface IQuery {
  id: string;
  name: string;
  opts: TQueryOptions;
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
  searchString: string | null;
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

export interface IWorkbenchTab {
  id: string;
  name: string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  opts: Partial<TWorkbenchOptions>;
  searchString: string | null;
}

export interface IWorkbenchTabSchema extends IWorkbenchTab {
  user: IUserSchema;
  team: ITeamSchema;
  dataSource: IDataSourceSchema;
}