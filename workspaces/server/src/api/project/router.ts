import {createRouter} from "../../utils/createRouter";
import {getRequestParams, getRequestQuery} from "../../utils/request";
import {
  DatabaseInspectionRepository,
  DataSourceRepository,
  QueriesRepository,
} from "../../repository/db";
import {FindManyOptions, Like} from "typeorm";
import {TFindQuery} from "@dataramen/types";
import { IDataSourceSchema, IQuerySchema } from "@dataramen/types";

export default createRouter((instance) => {
  instance.route({
    method: "get",
    url: "/team/:teamId/files",
    handler: async (request, reply) => {
      const { teamId } = getRequestParams<{ teamId: string }>(request);

      const query: FindManyOptions<IDataSourceSchema | IQuerySchema> = {
        where: {
          team: {
            id: teamId,
          },
        },
        order: {
          name: 'ASC',
        },
        select: {
          id: true,
          name: true,
          updatedAt: true,
        }
      };

      const [dataSources = [], queries = []] = await Promise.all([
        DataSourceRepository.find(query),
        QueriesRepository.find({
          ...query,
          where: {
            ...query.where,
            isTrash: false,
          }
        })
      ]);

      return {
        data: [
          ...dataSources.map((d) => ({ ...d, type: "dataSource" })),
          ...queries.map((w) => ({ ...w, type: "query" })),
        ],
      }
    },
  });

  instance.route({
    method: "get",
    url: "/team/:teamId/query",
    handler: async (request) => {
      const { teamId } = getRequestParams<{ teamId: string }>(request);
      const { search, size } = getRequestQuery<{ search: string, size: string }>(request);
      const perResultSize = (parseInt(size) || 20) / 2;

      const [tables, queries] = await Promise.all([
        DatabaseInspectionRepository.find({
          where: {
            tableName: Like(`%${search}%`),
            datasource: {
              team: {
                id: teamId,
              }
            },
          },
          relations: {
            datasource: true,
          },
          select: {
            id: true,
            tableName: true,
            datasource: {
              name: true,
              id: true,
            },
          },
          order: {
            tableName: "ASC",
          },
          take: perResultSize,
        }),
        QueriesRepository.find({
          where: {
            name: Like(`%${search}%`),
            isTrash: false,
            dataSource: {
              team: {
                id: teamId,
              }
            }
          },
          relations: {
            dataSource: true,
          },
          select: {
            id: true,
            name: true,
            dataSource: {
              name: true,
              id: true,
            },
          },
          order: {
            name: "ASC",
          },
          take: perResultSize,
        })
      ]);

      const result: TFindQuery[] = [];

      tables.forEach((t) => {
        result.push({
          name: t.tableName,
          id: t.id,
          dataSourceName: t.datasource?.name || '--',
          dataSourceId: t.datasource?.id || '--',
          type: 'table',
        });
      });

      queries.forEach((q) => {
        result.push({
          name: q.name,
          id: q.id,
          dataSourceName: q.dataSource?.name || '--',
          dataSourceId: q.dataSource?.id || '--',
          type: 'query',
        });
      });

      return {
        data: result,
      } satisfies { data: TFindQuery[] };
    },
  });
});