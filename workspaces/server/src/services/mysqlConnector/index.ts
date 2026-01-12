import mysql, {ResultSetHeader} from 'mysql2/promise';

import {
  TDynamicConnection,
  TDynamicConnectionConfig,
  TDynamicConnectionCreator,
  TIntrospectionResult,
  TQueryOptions
} from "../connectorManager/types";
import {TReferencesInspection} from "../../types/connectors";
import {TExecuteQueryResult} from "@dataramen/types";
import {HttpError} from "../../utils/httpError";
import {lowercase} from "../../utils/stringUtils";
import {getUrl} from "../../utils/dbUtils";

const getConnection = ({ database, password, user, url }: TDynamicConnectionConfig) => {
  return mysql.createConnection({
    host: getUrl(url),
    user: user,
    database: database,
    password: password,
    // TODO: timeout?
  });
};

const extractPrimaryKeys = async (connection: mysql.Connection) => {
  const query = `
      SELECT LOWER(TABLE_NAME) as TABLE_NAME, COLUMN_NAME, ORDINAL_POSITION
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE CONSTRAINT_NAME = 'PRIMARY'
      ORDER BY TABLE_NAME, ORDINAL_POSITION;
  `;

  const [rows] = await connection.execute(query);

  const primaryKeysMap: {[key: string]: string[]} = {};

  (rows as any[]).forEach(row => {
    const tableName = lowercase(row.TABLE_NAME);
    const columnName = row.COLUMN_NAME;

    if (!primaryKeysMap[tableName]) {
      primaryKeysMap[tableName] = [];
    }

    primaryKeysMap[tableName].push(columnName);
  });

  return primaryKeysMap;
};

const getReferences = async (connection: mysql.Connection) => {
  const query = `
      SELECT
          LOWER(TABLE_NAME) AS table_name,
          COLUMN_NAME AS field,
          REFERENCED_TABLE_NAME AS referenced_table,
          REFERENCED_COLUMN_NAME AS referenced_field
      FROM
          information_schema.KEY_COLUMN_USAGE
      WHERE
          REFERENCED_TABLE_NAME IS NOT NULL
        AND CONSTRAINT_SCHEMA = DATABASE();
  `;

  const [rows] = await connection.execute<mysql.RowDataPacket[]>(query);
  const result: TReferencesInspection = {};
  if (Array.isArray(rows)) {
    rows.forEach((row) => {
      if (!result[row.table_name]) {
        result[row.table_name] = {};
      }
      result[row.table_name][row.field] = {
        refTable: row.referenced_table,
        refField: row.referenced_field
      };
    });
  }

  return result;
};

const inspectSchema = async (dataSource: TDynamicConnectionConfig, connection: mysql.Connection): Promise<TIntrospectionResult[]> => {
  const result = await connection.query('SHOW TABLES');
  const tables = result[0] as Array<{[key: string]: string}>;
  const refs = await getReferences(connection);
  const primaryKeys = await extractPrimaryKeys(connection);
  const rows = tables.map(async (table) => {
    const tableName = lowercase(Object.values(table)[0]);
    const inspectColumnsQuery = `select COLUMN_NAME, DATA_TYPE from information_schema.columns where table_schema = '${dataSource.database}' and LOWER(table_name) = '${tableName}'`;
    const [columns] = await connection.query(inspectColumnsQuery);
    const ref = refs[tableName];

    return {
      columns: (columns as { COLUMN_NAME: string, DATA_TYPE: string }[])
        .map((column) => ({
          name: column.COLUMN_NAME,
          type: column.DATA_TYPE,
          isPrimary: primaryKeys[tableName]?.includes(column.COLUMN_NAME),
          ref: ref?.[column.COLUMN_NAME] ? {
            table: ref[column.COLUMN_NAME].refTable,
            field: ref[column.COLUMN_NAME].refField,
          } : undefined,
        }))
        .sort((col1, col2) => {
          if (col1.isPrimary && col2.isPrimary) {
            return col1.name.localeCompare(col2.name);
          }

          return col1.isPrimary ? -1 : 1;
        }),
      createdAt: new Date(),
      tableName: tableName,
      updatedAt: new Date(),
    };
  });

  return Promise.all(rows);
};

const executeQuery = async (query: string, connection: mysql.Connection, opts: TQueryOptions): Promise<TExecuteQueryResult> => {
  try {
    console.log(`[MYSQL CONN] Query: ${query}`);
    const [result, columns] = await connection.query({
      sql: query,
      rowsAsArray: true,
    });

    const responseType = result?.constructor?.name;
    if (responseType === "ResultSetHeader") {
      // UPDATE, INSERT, DELETE
      const resultSet = (result as ResultSetHeader);

      if (resultSet.affectedRows > 1 && opts.allowBulkUpdate !== true) {
        throw new Error(`[MYSQL CONN] Bulk update performed without permission.`);
      }

      return {
        columns: [{ column: "affectedRows", alias: "Affected rows", full: "affectedRows" }],
        rows: [[resultSet.affectedRows]],
        query,
      };
    } else if (responseType === "Array") {
      const rows = result as any; // todo: type
      return  {
        columns: columns?.map((column: { orgName: string; orgTable?: string; name: string; }) => ({
          column: column.orgName || column.name,
          table: lowercase(column.orgTable),
          alias: column.name,
          full: column.orgTable ? lowercase(column.orgTable) + "." + column.orgName : column.name,
        })) || [],
        rows,
        query,
      };
    }

    throw new Error(`[MYSQL CONN] Unknown result type: ${responseType}`);
  } catch (e: any) {
    console.error(e);
    if (e instanceof HttpError) {
      throw e;
    }

    throw new HttpError(400, e.message);
  }
};

const withTransaction = async <T>(connection: mysql.Connection, fn: () => Promise<T>): Promise<T> => {
  await connection.beginTransaction();
  try {
    const result = await fn();
    await connection.commit();
    console.log("[MYSQL CONN] Commit");
    return result;
  } catch (e: any) {
    await connection.rollback();
    console.warn(e.message);
    console.log("[MYSQL CONN] Rollback");
    throw e;
  }
};

const withReadOnlyTransaction = async <T>(connection: mysql.Connection, fn: () => Promise<T>): Promise<T> => {
  await connection.query("START TRANSACTION READ ONLY");
  try {
    const result = await fn();
    console.log("[MYSQL CONN] Read only rollback");
    await connection.query("ROLLBACK");
    return result;
  } catch (e: any) {
    console.warn(e.message);
    await connection.query("ROLLBACK");
    throw e;
  }
};

export const MySqlConnector: TDynamicConnectionCreator = async (dataSource: TDynamicConnectionConfig): Promise<TDynamicConnection> => {
  const connection = await getConnection(dataSource);
  let _isClosed = false;

  return {
    dbType: 'mysql',
    dataSource,
    inspectSchema: () => inspectSchema(dataSource, connection),
    executeQuery: (query, opts) => {
      if (opts.type === "SELECT") {
        return withReadOnlyTransaction(
          connection,
          () => executeQuery(query, connection, opts)
        );
      }

      return withTransaction(
        connection,
        () => executeQuery(query, connection, opts)
      );
    },
    checkConnection: async () => connection.ping(),
    isClosed: () => _isClosed,
    close: async () => {
      if (_isClosed) return;

      _isClosed = true;
      return connection.destroy();
    },
  };
};
