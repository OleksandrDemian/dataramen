import {createRouter} from "../../utils/createRouter";
import {getRequestParams, getRequestPayload, getRequestQuery} from "../../utils/request";
import {validateCreateDataSource} from "./validators";
import {HttpError} from "../../utils/httpError";
import {getDynamicConnection} from "../../services/connectorManager";
import {
  AppDataSource,
  DatabaseColumnRepository,
  DatabaseTableRepository,
  DataSourceRepository,
  QueriesRepository
} from "../../repository/db";
import {TCreateDataSource} from "./types";
import {mapDataSourceToDbConnection} from "../../utils/dataSourceUtils";
import {SymmEncryptionUtils} from "../../utils/symmEncryptionUtils";
import {EUserTeamRole, IDatabaseColumnSchema, IDatabaseInspection, IInspectionColumnRef} from "@dataramen/types";
import {atLeast} from "../../hooks/role";
import {TIntrospectionResult} from "../../services/connectorManager/types";
import {cleanupDatasourceInfo} from "../../services/datasource/cleanupDatasourceInfo";
import {DataSource} from "../../repository/tables/datasource";
import {Query} from "../../repository/tables/query";
import {DatabaseColumn} from "../../repository/tables/databaseColumn";
import {DatabaseTable} from "../../repository/tables/databaseTable";

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

export default createRouter((instance) => {
  // get datasource by id
  instance.route({
    method: "get",
    url: "/:id",
    handler: async (request) => {
      const { id } = getRequestParams<{ id: string }>(request);
      const dataSource = await DataSourceRepository.findOne({
        where: {
          id,
        }
      });

      if (!dataSource) {
        throw new HttpError(404, "Data source not found");
      }

      return {
        data: dataSource,
      };
    },
  });

  instance.route({
    method: "get",
    url: "/",
    handler: async (request) => {
      const { teamId } = getRequestQuery<{ teamId?: string }>(request);
      const dataSources = await DataSourceRepository.find({
        where: {
          team: {
            id: teamId,
          },
        },
        order: {
          createdAt: "DESC",
        },
      });

      return {
        data: dataSources,
      };
    },
  });

  // create data source
  instance.route({
    url: "/",
    method: "post",
    config: {
      requireRole: atLeast(EUserTeamRole.ADMIN),
    },
    handler: async (request) => {
      const { teamId, ownerId, ...proto } = getRequestPayload<TCreateDataSource>(request, validateCreateDataSource);
      const dataSource = DataSourceRepository.create({
        ...proto,
        allowUpdate: !!proto.allowUpdate,
        allowInsert: !!proto.allowInsert,
        team: {
          id: teamId,
        },
        owner: {
          id: ownerId,
        }
      });

      const connection = await getDynamicConnection(mapDataSourceToDbConnection(dataSource), dataSource.dbType, request);
      try {
        await connection.checkConnection();
      } catch (e: any) {
        throw new HttpError(400, "Cannot connect to the database, please check datasource configuration");
      }

      const { tag, iv, encrypted } = SymmEncryptionUtils.encrypt(dataSource.dbPassword!);

      dataSource.dbPassword = encrypted;
      dataSource.dbPasswordIv = iv;
      dataSource.dbPasswordTag = tag;

      const createdDataSource = await DataSourceRepository.save(dataSource);
      return {
        data: createdDataSource,
      };
    },
  });

  // update datasource
  instance.route({
    method: "put",
    url: "/:id",
    config: {
      requireRole: atLeast(EUserTeamRole.ADMIN),
    },
    handler: async (request) => {
      const { id } = getRequestParams<{ id: string }>(request);
      const payload = getRequestPayload<TCreateDataSource>(request);
      const dataSource = await DataSourceRepository.findOneBy({
        id,
      });

      if (!dataSource) {
        throw new HttpError(404, "Data source not found");
      }

      const updated = DataSourceRepository.merge(dataSource, payload);
      await DataSourceRepository.save(updated);
      return {
        data: updated,
      };
    }
  });

  // remove datasource
  instance.route({
    method: "delete",
    url: "/:id",
    config: {
      requireRole: atLeast(EUserTeamRole.ADMIN),
    },
    handler: async (request) => {
      return AppDataSource.transaction(async (entityManager) => {
        // todo: fix transaction
        const {id} = getRequestParams<{ id: string }>(request);

        await Promise.all([
          cleanupDatasourceInfo(entityManager, id),
          entityManager.delete(Query, {
            dataSource: {
              id,
            },
          }),
        ]);

        await entityManager.delete(DataSource, {
          id,
        });
      });
    },
  });

  // inspect datasource
  instance.route({
    method: "post",
    url: "/:id/inspect",
    handler: async (request, reply) => {
      return AppDataSource.transaction(async (entityManager) => {
        const { id } = getRequestParams<{ id: string }>(request);
        const dataSource = await entityManager.findOne(DataSource, {
          where: {
            id,
          },
          select: ["id", "dbType", "dbDatabase", "dbPassword", "dbPasswordTag", "dbPasswordIv", "dbPort", "dbUrl", "dbSchema", "dbUser"],
        });

        if (!dataSource) {
          throw new Error("Data source not found");
        }

        dataSource.status = "INSPECTING";
        await entityManager.save(DataSource, dataSource);

        const connection = await getDynamicConnection(mapDataSourceToDbConnection(dataSource, true), dataSource.dbType, request);
        // inspect dataSource
        const inspection = await connection.inspectSchema();

        await cleanupDatasourceInfo(entityManager, dataSource.id);

        const referencedBy = computeReferencedBy(inspection);
        for (const insp of inspection) {
          const table = await entityManager.save(DatabaseTable, {
            datasource: {
              id,
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
        dataSource.status = "READY";
        dataSource.lastInspected = new Date();
        await entityManager.save(DataSource, dataSource);
      });
    },
  });

  instance.route({
    method: "get",
    url: "/:id/inspections",
    handler: async (request) => {
      const { id } = getRequestParams<{ id: string }>(request);
      const tables = await DatabaseTableRepository.find({
        where: {
          datasource: {
            id,
          }
        },
        relations: { columns: true },
        order: {
          name: "ASC",
          columns: {
            isPrimary: "DESC",
            name: "ASC"
          }
        },
      });

      // todo: retro-compatibility with current UI, will be refactored into Tables and Columns
      const data: IDatabaseInspection[] = tables.map((t) => {
        return {
          tableName: t.name,
          id: t.id,
          updatedAt: t.updatedAt,
          createdAt: t.createdAt,
          columns: t.columns.map((c) => ({
            name: c.name,
            type: c.type,
            isPrimary: c.isPrimary,
            ref: c.meta?.refs,
          })),
        }
      });

      return {
        data,
      };
    },
  })
});
