import {TDynamicConnection, TDynamicConnectionConfig} from "./types";
import {MySqlConnector} from "../mysqlConnector";
import {HttpError} from "../../utils/httpError";
import {FastifyRequest} from "fastify";
import {PGSqlConnector} from "../pgConnector";

export const getDynamicConnection = async (datasource: TDynamicConnectionConfig, dbType: string, req: FastifyRequest): Promise<TDynamicConnection> => {
  try {
    let dbConnectionManager: TDynamicConnection;
    if (dbType === "mysql") {
      dbConnectionManager = await MySqlConnector(datasource);
    } else if (dbType === "postgres") {
      dbConnectionManager = await PGSqlConnector(datasource);
    } else {
      throw new HttpError(500, `Connection manager for ${dbType} not found`);
    }

    if (!req.__connections) {
      req.__connections = [dbConnectionManager];
    } else {
      req.__connections.push(dbConnectionManager);
    }

    return dbConnectionManager;
  } catch (error: any) {
    console.error(error);
    if (error instanceof HttpError) {
      throw error;
    }

    if (error?.code === "ECONNREFUSED") {
      throw new HttpError(500, "Failed to connect to the database");
    }

    throw new HttpError(500, error.message);
  }
};

export const getUnscopedDynamicConnection = async (datasource: TDynamicConnectionConfig, dbType: string) => {
  try {
    let dbConnectionManager: TDynamicConnection;
    if (dbType === "mysql") {
      dbConnectionManager = await MySqlConnector(datasource);
    } else if (dbType === "postgres") {
      dbConnectionManager = await PGSqlConnector(datasource);
    } else {
      throw new HttpError(500, `Connection manager for ${dbType} not found`);
    }

    return dbConnectionManager;
  } catch (error: any) {
    console.error(error);
    if (error instanceof HttpError) {
      throw error;
    }

    if (error?.code === "ECONNREFUSED") {
      throw new HttpError(500, "Failed to connect to the database");
    }

    throw new HttpError(500, error.message);
  }
};
