import {DataSource, Driver} from "typeorm";
import {TDatabaseDialect} from "@dataramen/types";

const mysqlDs = new DataSource({
  type: 'mysql',
});

const postgresDs = new DataSource({
  type: 'postgres',
});

export const getDatasourceQueryBuilder = (ds: TDatabaseDialect) => {
  switch (ds) {
    case 'postgres':
      return postgresDs.createQueryBuilder();
    case 'mysql':
      return mysqlDs.createQueryBuilder();
    default:
      throw new Error('Unsupported database connection');
  }
};

export const DatasourceDriver: Record<TDatabaseDialect, Driver> = {
  'postgres': postgresDs.driver,
  'mysql': mysqlDs.driver,
};
