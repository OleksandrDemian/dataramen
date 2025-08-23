export type TCreateDataSource = {
  name: string;
  dbType: string;
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