import {TDynamicConnectionConfig} from "../services/connectorManager/types";
import {SymmEncryptionUtils} from "./symmEncryptionUtils";
import { IDataSource } from "@dataramen/types";

export const mapDataSourceToDbConnection = (dataSource: IDataSource, decrypt: boolean = false): TDynamicConnectionConfig => {
  if (decrypt) {
    const password = SymmEncryptionUtils.decrypt({
      encrypted: dataSource.dbPassword!,
      tag: dataSource.dbPasswordTag!,
      iv: dataSource.dbPasswordIv!,
    });

    return {
      url: dataSource.dbUrl,
      user: dataSource.dbUser,
      database: dataSource.dbDatabase,
      password: password,
      port: dataSource.dbPort,
      schema: dataSource.dbSchema,
    };
  }

  return {
    url: dataSource.dbUrl,
    user: dataSource.dbUser,
    database: dataSource.dbDatabase,
    password: dataSource.dbPassword,
    port: dataSource.dbPort,
    schema: dataSource.dbSchema,
  };
};
