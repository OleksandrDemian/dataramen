import {createRouter} from "../../utils/createRouter";
import {getRequestParams, getRequestQuery} from "../../utils/request";
import {
  DatabaseInspectionRepository,
  DataSourceRepository,
  QueriesRepository,
} from "../../repository/db";
import {FindOptionsWhere, In, Like} from "typeorm";
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
      const { teamId } = getRequestParams<{ teamId: string }>(request);

      const queries = await QueriesRepository.find({
        where: {
          team: {
            id: teamId,
          },
          isTrash: false,
        },
        order: {
          name: 'ASC',
        },
        select: {
          id: true,
          name: true,
          updatedAt: true,
        },
      });

      return {
        data: queries satisfies TProjectQuery[],
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

      const dsFilter: FindOptionsWhere<IDataSourceSchema> = {
        team: {
          id: teamId,
        }
      };

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
        QueriesRepository.find({
          where: {
            name: Like(`%${search}%`),
            isTrash: false,
            dataSource: dsFilter,
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