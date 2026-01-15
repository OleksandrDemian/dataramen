import {DataSource} from "typeorm";
import {DatabaseDialect} from "@dataramen/sql-builder";

const mysqlDs = new DataSource({
  type: 'mysql',
});

const postgresDs = new DataSource({
  type: 'postgres',
});

export const getDatasourceQueryBuilder = (ds: DatabaseDialect) => {
  switch (ds) {
    case 'postgres':
      return postgresDs.createQueryBuilder();
    case 'mysql':
      return mysqlDs.createQueryBuilder();
    default:
      throw new Error('Unsupported database connection');
  }
};

export const DatasourceDriver = {
  'postgres': postgresDs.driver,
  'mysql': mysqlDs.driver,
};
