import {IDataSource} from "@dataramen/types";

export type TDataSourceID = string;

export type TCreateDataSource = Omit<IDataSource, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
  teamId: string;
  ownerId: string;
};

export type TDataSourceWOwner = IDataSource & {
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

