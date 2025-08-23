export type TDataSourceID = string;

export type TColumnDescription = { name: string; type: string };

export type TDataSource = {
  id: TDataSourceID;
  name: string;
  description?: string;
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
  allowInsert?: boolean;
  allowUpdate?: boolean;
};

export type TCreateDataSource = Omit<TDataSource, 'id'>;

export type TDataSourceWOwner = TDataSource & {
  owner?: {
    email: string;
  };
};

export type TDatabaseInspectionRef = {
  table: string;
  field: string;
};

export type TDatabaseInspectionColumn = {
  name: string;
  type: string;
  isPrimary?: boolean;
  ref?: TDatabaseInspectionRef;
};

export type TDatabaseInspection = {
  id: string;
  datastoreId: string;
  tableName: string;
  columns: TDatabaseInspectionColumn[];
  createdAt: Date;
  updatedAt: Date;
};

