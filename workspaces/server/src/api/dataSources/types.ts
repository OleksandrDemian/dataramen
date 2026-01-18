import { TDatabaseDialect } from "@dataramen/types";

export type TCreateDataSource = {
  name: string;
  dbType: TDatabaseDialect;
  dbUser: string;
  dbUrl: string;
  dbPassword?: string;
  ownerId: string;
  dbDatabase: string;
  dbSchema?: string;
  dbPort: number;
  lastInspected?: string;
  teamId: string;
  allowUpdate?: boolean;
  allowInsert?: boolean;
};