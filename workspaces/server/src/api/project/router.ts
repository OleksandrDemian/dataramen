import {createRouter} from "../../utils/createRouter";
import {getRequestParams, getRequestQuery} from "../../utils/request";
import {
  DatabaseInspectionRepository,
  DataSourceRepository,
  QueriesRepository, SavedQueriesRepository,
} from "../../repository/db";
import {And, Brackets, FindOptionsWhere, In, Like} from "typeorm";
import {IDataSource, IDataSourceSchema, TFindQuery, TProjectDataSource, TProjectQuery} from "@dataramen/types";

export default createRouter((instance) => {
  instance.route({
    method: "get",
    url: "/team/:teamId/datasources",
    handler: async (request, reply) => {
      const { teamId } = getRequestParams<{ teamId: string }>(request);

      const dataSources = await DataSourceRepository.find({
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
          dbType: true,
          description: true,
          allowInsert: true,
          allowUpdate: true,
        },
      });

      return {
        data: dataSources satisfies TProjectDataSource[],
      };
    },
  });

  instance.route({
    method: "get",
    url: "/team/:teamId/queries",
    handler: async (request, reply) => {
      const queryParams = getRequestParams<{ teamId?: string; }>(request);
      const teamId = queryParams.teamId || request.user.currentTeamId;

      const queries = await SavedQueriesRepository.find({
        where: [
          {
            isPersonal: false,
            team: { id: teamId }
          },
          {
            isPersonal: true,
            team: { id: teamId },
            user: { id: request.user.id },
          },
        ],
        relations: {
          query: true,
        },
        select: {
          id: true,
          query: {
            id: true,
            name: true,
            updatedAt: true,
          },
        },
      });

      const data: TProjectQuery[] = queries.map((q) => ({
        name: q.query.name,
        id: q.query.id,
        updatedAt: q.query.updatedAt,
        savedQueryId: q.id,
      }));

      return {
        data
      };
    },
  });

  instance.route({
    method: "get",
    url: "/team/:teamId/query",
    handler: async (request) => {
      const { teamId } = getRequestParams<{ teamId: string }>(request);
      const { search, size, selectedDataSources } = getRequestQuery<{ search: string, size: string; selectedDataSources?: string[] }>(request);
      const perResultSize = (parseInt(size) || 20) / 2;

      const dsFilter: FindOptionsWhere<IDataSourceSchema> = {};

      if (selectedDataSources?.length) {
        dsFilter.id = In(selectedDataSources);
      }

      const [tables, queries] = await Promise.all([
        DatabaseInspectionRepository.find({
          where: {
            tableName: Like(`%${search}%`),
            datasource: dsFilter,
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
        SavedQueriesRepository.find({
          where:  [
            {
              // select team queries
              query: {
                dataSource: dsFilter,
                name: Like(`%${search}%`),
              },
              team: { id: teamId },
              isPersonal: false,
            },
            {
              // select private queries
              query: {
                dataSource: dsFilter,
                name: Like(`%${search}%`),
              },
              team: { id: teamId },
              isPersonal: true,
              user: { id: request.user.id },
            }
          ],
          relations: {
            query: {
              dataSource: true,
            },
          },
          select: {
            id: true,
            query: {
              id: true,
              name: true,
              dataSource: {
                name: true,
              },
            }
          },
          order: {
            query: {
              name: "ASC",
            }
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
          name: q.query.name,
          id: q.query.id,
          dataSourceName: q.query.dataSource?.name || '--',
          dataSourceId: q.query.dataSource?.id || '--',
          type: 'query',
        });
      });

      return {
        data: result,
      } satisfies { data: TFindQuery[] };
    },
  });
});