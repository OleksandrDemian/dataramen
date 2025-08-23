import {createRouter} from "../../utils/createRouter";
import {getRequestParams, getRequestPayload, getRequestQuery} from "../../utils/request";
import {validateCreateDataSource} from "./validators";
import {HttpError} from "../../utils/httpError";
import {getDynamicConnection} from "../../services/connectorManager";
import {
  AppDataSource,
  DatabaseInspectionRepository,
  DataSourceRepository,
  QueriesRepository
} from "../../repository/db";
import {TCreateDataSource} from "./types";
import {mapDataSourceToDbConnection} from "../../utils/dataSourceUtils";
import {SymmEncryptionUtils} from "../../utils/symmEncryptionUtils";
import {EUserTeamRole} from "@dataramen/types";
import {atLeast} from "../../hooks/role";

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
    handler: async (request, reply) => {
      return AppDataSource.transaction(async () => {
        const {id} = getRequestParams<{ id: string }>(request);
        await Promise.all([
          DatabaseInspectionRepository.delete({
            datasource: {
              id,
            }
          }),
          QueriesRepository.delete({
            dataSource: {
              id,
            },
          }),
        ]);

        await DataSourceRepository.delete({
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
      const { id } = getRequestParams<{ id: string }>(request);
      const dataSource = await DataSourceRepository.findOne({
        where: {
          id,
        },
        select: ["id", "dbType", "dbDatabase", "dbPassword", "dbPasswordTag", "dbPasswordIv", "dbPort", "dbUrl", "dbSchema", "dbUser"],
      });

      if (!dataSource) {
        throw new Error("Data source not found");
      }

      dataSource.status = "INSPECTING";
      await DataSourceRepository.save(dataSource);

      const connection = await getDynamicConnection(mapDataSourceToDbConnection(dataSource, true), dataSource.dbType, request);
      // inspect dataSource
      const inspection = await connection.inspectSchema();
      // destroy previous inspections
      await DatabaseInspectionRepository.delete({
        datasource: {
          id,
        }
      });

      await DatabaseInspectionRepository.insert(
        inspection.sort().map((i) => DatabaseInspectionRepository.create({
          tableName: i.tableName,
          columns: i.columns,
          datasource: {
            id,
          },
        })),
      );

      // update datasource last inspected
      dataSource.status = "READY";
      dataSource.lastInspected = new Date();
      await DataSourceRepository.save(dataSource);
    },
  });

  instance.route({
    method: "get",
    url: "/:id/inspections",
    handler: async (request) => {
      const { id } = getRequestParams<{ id: string }>(request);
      const inspections = await DatabaseInspectionRepository.find({
        where: {
          datasource: {
            id,
          }
        },
      });
      return {
        data: inspections,
      };
    },
  })
});
