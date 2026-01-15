import {
  TDynamicConnection,
  TDynamicConnectionConfig,
  TDynamicConnectionCreator,
  TIntrospectionResult,
  TQueryOptions
} from "../connectorManager/types";
import pg from 'pg';
import {TReferencesInspection} from "../../types/connectors";
import {TExecuteQueryResult} from "@dataramen/types";
import {HttpError} from "../../utils/httpError";
import {getUrl} from "../../utils/dbUtils";

const getConnection = async ({ database, password, user, url, port }: TDynamicConnectionConfig) => {
  const client = new pg.Client({
    host: getUrl(url),
    user: user,
    database: database,
    password: password,
    port: port,
    query_timeout: 10_000, // 10 seconds
  });

  await client.connect();
  return client;
};

const extractPrimaryKeys = async (client: pg.Client) => {
  const query = `
      SELECT
          LOWER(kcu.table_name) as table_name,
          kcu.column_name,
          kcu.ordinal_position
      FROM
        information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
             ON tc.constraint_name = kcu.constraint_name
                 AND tc.table_schema = kcu.table_schema
      WHERE
          tc.constraint_type = 'PRIMARY KEY'
      ORDER BY
          table_name, kcu.ordinal_position;
  `;

  const result = await client.query(query);

  const primaryKeysMap: {[key: string]: string[]} = {};

  result.rows.forEach(row => {
    const tableName = row.table_name;
    const columnName = row.column_name;

    if (!primaryKeysMap[tableName]) {
      primaryKeysMap[tableName] = [];
    }

    primaryKeysMap[tableName].push(columnName);
  });

  return primaryKeysMap;
};

const getReferences = async (connection: pg.Client) => {
  const query = `
    SELECT
      LOWER(tc.table_name) AS table_name,
      kcu.column_name AS field,
      LOWER(ccu.table_name) AS referenced_table,
      ccu.column_name AS referenced_field
    FROM
      information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY';
  `;

  const res = await connection.query(query);
  const result: TReferencesInspection = {};
  res.rows.forEach(row => {
    if (!result[row.table_name]) {
      result[row.table_name] = {};
    }
    result[row.table_name][row.field] = {
      refTable: row.referenced_table,
      refField: row.referenced_field
    };
  });

  return result;
};

const inspectSchema = async (dataSource: TDynamicConnectionConfig, connection: pg.Client): Promise<TIntrospectionResult[]> => {
  const tableQuery = `SELECT LOWER(tablename) as tablename FROM pg_catalog.pg_tables WHERE schemaname = '${dataSource.schema}'`;
  const result = await connection.query(tableQuery);
  const tables = result.rows as Array<{ tablename: string }>;
  const refs = await getReferences(connection);
  const primaryKeys = await extractPrimaryKeys(connection);
  const rows = tables.map(async (table) => {
    const tableName = Object.values(table)[0];
    const pgQuery = `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE
            LOWER(table_name) = '${tableName}' and
            table_schema = '${dataSource.schema}'
    `;
    const { rows } = await connection.query(pgQuery);
    const ref = refs[tableName];
    return {
      columns: (rows as { column_name: string, data_type: string }[])
        .map((column) => ({
          name: column.column_name,
          type: column.data_type,
          isPrimary: primaryKeys[tableName]?.includes(column.column_name),
          ref: ref?.[column.column_name] ? {
            table: ref[column.column_name].refTable,
            field: ref[column.column_name].refField,
          } : undefined,
        }))
        .sort((col1, col2) => {
          if (col1.isPrimary && col2.isPrimary) {
            return col1.name.localeCompare(col2.name);
          }

          return col1.isPrimary ? -1 : 1;
        }),
      createdAt: new Date(),
      tableName,
      updatedAt: new Date(),
    } satisfies TIntrospectionResult;
  });

  return Promise.all(rows);
};

type TExtractResult = Record<string, { table: string; column: string; }>;
const extractTableNames = async (columnIds: string[], connection: pg.Client): Promise<TExtractResult> => {
  const query = `select LOWER(relname) as relname, attname, concat(pg_class.oid, '-', attnum) as row_key
   from pg_attribute
      left join pg_class on pg_attribute.attrelid = pg_class.oid
   where
     concat(pg_class.oid, '-', attnum) IN (${columnIds.join(", ")})
   limit 75;`; // hard limit for no reason, check if needed, otherwise remove

  const result = await connection.query(query);
  return result.rows.reduce<TExtractResult>((acc, row) => {
    acc[row.row_key] = { table: row.relname, column: row.attname };
    return acc;
  }, {});
};

const executeQuery = async (query: string, params: any, connection: pg.Client, opts: TQueryOptions): Promise<TExecuteQueryResult> => {
  try {
    console.log(`[PG CONN] Query: ${query}`);
    console.log(`[PG CONN] Params: ${JSON.stringify(params, null, 2)}`);
    const { rows, fields, command, rowCount } = await connection.query({
      text: query,
      rowMode: "array",
      values: params,
    });

    if (command === "UPDATE" || command === "INSERT" || command === "DELETE") {
      if (rowCount != null && rowCount > 1 && opts.allowBulkUpdate !== true) {
        throw new Error(`[PG CONN] Bulk update performed without permission.`);
      }

      return {
        columns: [{ column: "affectedRows", alias: "Affected rows", full: "affectedRows" }],
        rows: [[rowCount]],
        query,
      }
    }

    if (command === "SELECT") {
      const cols = fields.map((column) => `'${column.tableID}-${column.columnID}'`);
      const headerOG = await extractTableNames(cols, connection);

      return {
        columns: fields.map((column) => {
          const ogCol = headerOG[`${column.tableID}-${column.columnID}`];

          return {
            column: ogCol?.column || column.name,
            alias: column.name,
            table: ogCol?.table || '',
            full: ogCol ? ogCol.table + "." + ogCol.column : column.name,
          };
        }),
        rows: rows as any[][],
        query,
      };
    }

    throw new Error(`[PG CONN] Unsupported command: ${command}`);
  } catch (e: any) {
    if (e instanceof HttpError) {
      throw e;
    }

    throw new HttpError(400, e.message);
  }
};

const withTransaction = async <T>(client: pg.Client, fn: () => Promise<T>): Promise<T> => {
  await client.query("BEGIN");
  try {
    const result = await fn();
    await client.query("COMMIT");
    console.log(`[PG CONN] Commit`);
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    console.log(`[PG CONN] Rollback`);
    throw e;
  }
};

const withReadOnlyTransaction = async <T>(client: pg.Client, fn: () => Promise<T>): Promise<T> => {
  await client.query("BEGIN READ ONLY");
  try {
    const result = await fn();
    console.log(`[PG CONN] Read only rollback`);
    await client.query("ROLLBACK");
    return result;
  } catch (e) {
    console.log(`[PG CONN] Rollback`);
    await client.query("ROLLBACK");
    throw e;
  }
};

export const PGSqlConnector: TDynamicConnectionCreator = async (dataSource: TDynamicConnectionConfig): Promise<TDynamicConnection> => {
  const client = await getConnection(dataSource);
  let _isClosed = false;
  let isPathSet = false;

  const withPathSet = async <T>(fn: () => Promise<T>) => {
    if (!isPathSet) {
      await client.query(`SET search_path TO ${dataSource.schema}`);
    }

    return fn();
  };

  return {
    dbType: 'postgres',
    dataSource,
    inspectSchema: () => inspectSchema(dataSource, client),
    executeQuery: (opts) => withPathSet(
      () => { // todo: refactor this, make it better
        if (opts.type === "SELECT") {
          return withReadOnlyTransaction(
            client,
            () => executeQuery(opts.sql, opts.params, client, opts)
          );
        }

        return withTransaction(client, () => executeQuery(opts.sql, opts.params, client, opts));
      },
    ),
    checkConnection: async () => {},
    isClosed: () => _isClosed,
    close: async () => {
      if (_isClosed) return;

      _isClosed = true;
      return client.end();
    },
  };
};
