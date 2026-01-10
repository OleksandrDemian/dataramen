import {createRouter} from "../../utils/createRouter";
import {getRequestParams, getRequestQuery} from "../../utils/request";
import {
  DatabaseInspectionRepository,
  DataSourceRepository,
  SavedQueriesRepository,
  WorkbenchTabsRepository,
} from "../../repository/db";
import {FindOptionsWhere, In, Like, Raw} from "typeorm";
import {
  IDataSourceSchema,
  TFindQuery,
  TProjectDataSource,
  TProjectQuery,
  TProjectTabsHistoryEntry
} from "@dataramen/types";

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
      const params = getRequestParams<{ teamId?: string; }>(request);
      const queryParams = getRequestQuery<{ nameFilter: string; size: string; }>(request);
      const teamId = params.teamId || request.user.currentTeamId;

      const queryFilter = queryParams.nameFilter?.length ? {
        name: Raw((alias) => `LOWER(${alias}) LIKE :search`, { search: `%${queryParams.nameFilter.toLowerCase()}%` })
      } : undefined;

      const queries = await SavedQueriesRepository.find({
        where: [
          {
            isPersonal: false,
            team: { id: teamId },
            query: queryFilter,
          },
          {
            isPersonal: true,
            team: { id: teamId },
            query: queryFilter,
            user: { id: request.user.id },
          },
        ],
        relations: {
          query: {
            dataSource: true,
          },
        },
        take: Number(queryParams.size) || 20,
        select: {
          id: true,
          query: {
            id: true,
            name: true,
            updatedAt: true,
            dataSource: {
              name: true,
              dbType: true,
            },
          },
        },
        order: {
          query: {
            updatedAt: "DESC",
          },
        },
      });

      const data: TProjectQuery[] = queries.map((q) => ({
        name: q.query.name,
        id: q.query.id,
        updatedAt: q.query.updatedAt,
        savedQueryId: q.id,
        datasourceName: q.query.dataSource.name,
        datasourceType: q.query.dataSource.dbType,
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

  instance.route({
    method: "get",
    url: "/team/:teamId/tabs-history",
    handler: async (request) => {
      const { teamId, } = getRequestParams<{ teamId: string }>(request);
      const query = getRequestQuery<{ page: number; size: number; archived?: string }>(request);

      const page = Number(query.page);
      const size = Number(query.size);
      const userId = request.user.id;

      const workbenchTabs = await WorkbenchTabsRepository.find({
        where: {
          team: { id: teamId },
          user: { id: userId },
          archived: query.archived ? query.archived === "true" : undefined,
        },
        relations: {
          dataSource: true,
        },
        order: {
          updatedAt: 'DESC',
        },
        take: size + 1,
        skip: page * size,
      });

      let hasMore = false;
      if (workbenchTabs.length > size) {
        workbenchTabs.pop();
        hasMore = true;
      }

      return {
        data: workbenchTabs.map((t) => ({
          name: t.name,
          id: t.id,
          updatedAt: t.updatedAt,
          archived: t.archived,
          createdAt: t.createdAt,
          dataSourceId: t.dataSource?.id,
          dataSourceName: t.dataSource?.name,
          dataSourceType: t.dataSource?.dbType,
        })),
        hasMore,
      } satisfies { data: TProjectTabsHistoryEntry[]; hasMore: boolean; };
    },
  })
});
