// todo: migrate to scheduler
import {AppDataSource, DatabaseColumnRepository, DataSourceRepository} from "../../repository/db";
import {IDatabaseColumnSchema, IInspectionColumnRef} from "@dataramen/types";
import {DataSource} from "../../repository/tables/datasource";
import {getUnscopedDynamicConnection} from "../../services/connectorManager";
import {mapDataSourceToDbConnection} from "../../utils/dataSourceUtils";
import {cleanupDatasourceInfo} from "../../services/datasource/cleanupDatasourceInfo";
import {DatabaseTable} from "../../repository/tables/databaseTable";
import {DatabaseColumn} from "../../repository/tables/databaseColumn";
import {TIntrospectionResult} from "../../services/connectorManager/types";

function computeReferencedBy (introspection: TIntrospectionResult[]) {
  const refs = new Map<string, IInspectionColumnRef[]>();

  for (const table of introspection) {
    table.columns?.forEach((col) => {
      if (col.ref) {
        const key = `${col.ref.table}.${col.ref.field}`;
        const existing = refs.get(key) || [];
        existing.push({
          table: table.tableName,
          field: col.name,
        });
        refs.set(key, existing);
      }
    });
  }

  return refs;
}

export const inspectDataSourceTask = async (dataSourceId: string): Promise<boolean> => {
  const dataSource = await DataSourceRepository.findOne({
    where: {
      id: dataSourceId,
    },
    select: ["id", "dbType", "dbDatabase", "dbPassword", "dbPasswordTag", "dbPasswordIv", "dbPort", "dbUrl", "dbSchema", "dbUser"],
  });

  if (!dataSource) {
    throw new Error("Data source not found");
  }

  dataSource.status = "INSPECTING";
  await DataSourceRepository.save(dataSource);

  AppDataSource.transaction(async (entityManager) => {
    const connection = await getUnscopedDynamicConnection(mapDataSourceToDbConnection(dataSource, true), dataSource.dbType);
    // inspect dataSource
    const inspection = await connection.inspectSchema();

    await cleanupDatasourceInfo(entityManager, dataSource.id);

    const referencedBy = computeReferencedBy(inspection);
    for (const insp of inspection) {
      const table = await entityManager.save(DatabaseTable, {
        datasource: {
          id: dataSourceId,
        },
        name: insp.tableName,
      });

      if (insp.columns) {
        const columns: IDatabaseColumnSchema[] = [];
        for (const col of insp.columns) {
          columns.push(DatabaseColumnRepository.create({
            table: {
              id: table.id,
            },
            name: col.name,
            isPrimary: !!col.isPrimary,
            type: col.type,
            meta: {
              refs: col.ref,
              referencedBy: referencedBy.get(`${table.name}.${col.name}`),
            }
          }));
        }

        await entityManager.save(DatabaseColumn, columns);
      }
    }

    // update datasource last inspected
    await entityManager.save(DataSource, {
      id: dataSourceId,
      status: "READY",
      lastInspected: new Date(),
    });
  }).catch((err) => {
    // inspection failed, put status back to ready, the changes are rolled back
    console.error(err);
    DataSourceRepository.save({
      id: dataSourceId,
      status: "FAILED",
    });
  });

  return true;
};
