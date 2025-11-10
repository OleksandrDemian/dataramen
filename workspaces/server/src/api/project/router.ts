import {createRouter} from "../../utils/createRouter";
import {getRequestParams, getRequestQuery} from "../../utils/request";
import {
  DatabaseInspectionRepository,
  DataSourceRepository,
  SavedQueriesRepository,
  WorkbenchTabsRepository,
} from "../../repository/db";
import {FindOptionsWhere, In, Like, Raw} from "typeorm";
import {IDataSourceSchema, TFindQuery, TProjectDataSource, TProjectQuery} from "@dataramen/types";

export default createRouter((instance) => {
  instance.route({
    method: "get",
    url: "/team/:teamId/datasources",
    handler: async (request) => {
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
    handler: async (request) => {
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
      const perResultSize = search.length > 3 ? parseInt(size) || 20 : 8;

      const dsFilter: FindOptionsWhere<IDataSourceSchema> = {};

      if (selectedDataSources?.length) {
        dsFilter.id = In(selectedDataSources);
      }

      // todo: optimize this API
      const [tables, tabs, queries] = await Promise.all([
        DatabaseInspectionRepository.find({
          where: {
            tableName: Raw((alias) => `LOWER(${alias}) LIKE :search`, { search: `%${search.toLowerCase()}%` }),
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
            tableName: 'ASC',
          },
          take: perResultSize,
        }),
        WorkbenchTabsRepository.find({
          where:  {
            searchString: Like(`%${search.toLowerCase()}%`),
            team: { id: teamId },
            user: { id: request.user.id },
            dataSource: dsFilter
          },
          relations: {
            dataSource: true,
          },
          select: {
            id: true,
            name: true,
            updatedAt: true,
            dataSource: {
              id: true,
              name: true,
            },
          },
          order: {
            updatedAt: 'ASC',
          },
          take: perResultSize,
        }),
        SavedQueriesRepository.find({
          where: {
            searchString: Like(`%${search.toLowerCase()}%`),
            team: { id: teamId },
            query: { dataSource: dsFilter },
          },
          relations: {
            query: {
              dataSource: true,
            },
          },
          select: {
            id: true,
            updatedAt: true,
            query: {
              id: true,
              name: true,
              dataSource: {
                name: true,
              },
            }
          },
          order: {
            updatedAt: 'ASC',
          },
          take: perResultSize,
        }),
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

      tabs.forEach((t) => {
        result.push({
          name: t.name,
          id: t.id,
          dataSourceName: t.dataSource?.name || '--',
          dataSourceId: t.dataSource?.id || '--',
          type: 'tab',
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
