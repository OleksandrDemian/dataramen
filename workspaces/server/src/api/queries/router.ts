import {createRouter} from "../../utils/createRouter";
import {getRequestParams, getRequestPayload, getRequestQuery} from "../../utils/request";
import {parseOrderQueryParam} from "../../utils/queryUtils";
import {HttpError} from "../../utils/httpError";
import {AppDataSource, DataSourceRepository, QueriesRepository} from "../../repository/db";
import {TCreateQuery, TFindQueryParams, TUpdateQuery, EUserTeamRole, IQuerySchema} from "@dataramen/types";
import {FindOptionsWhere, Like} from "typeorm";
import {atLeast} from "../../hooks/role";

export default createRouter((instance) => {
  instance.route({
    method: "get",
    url: "/",
    handler: async (request) => {
      const { dataSourceId, teamId, limit, orderBy, name } = getRequestQuery<TFindQueryParams>(request);

      if (!dataSourceId && !teamId) {
        throw new HttpError(400, "Either dsId or teamId is required");
      }

      const where: FindOptionsWhere<IQuerySchema> = {
        isTrash: false,
      };

      if (dataSourceId) {
        where.dataSource = {
          id: dataSourceId,
        };
      }

      if (teamId) {
        where.team = {
          id: teamId,
        };
      }

      if (name) {
        where.name = Like(`%${name}%`);
      }

      const queries = await QueriesRepository.find({
        where,
        take: limit,
        order: parseOrderQueryParam(orderBy, {
          createdAt: "DESC",
        })
      });

      return {
        data: queries,
      };
    },
  });

  instance.route({
    method: "get",
    url: "/:id",
    handler: async (request) => {
      const { id } = getRequestParams<{ id: string }>(request);
      const query = await QueriesRepository.findOne({
        where: {
          id,
        },
        select: {
          dataSource: {
            id: true,
          },
        },
        relations: {
          dataSource: true,
        }
      });

      if (!query) {
        return {
          status: 404,
          data: "Query not found",
        };
      }

      return {
        data: query,
      };
    },
  });

  instance.route({
    method: "post",
    url: "/",
    config: {
      requireRole: atLeast(EUserTeamRole.EDITOR),
    },
    handler: async (request) => {
      const payload = getRequestPayload<TCreateQuery>(request);
      const dataSource = await DataSourceRepository.findOne({
        where: {
          id: payload.dataSourceId,
        },
        relations: {
          team: true,
        },
      });

      const query = await QueriesRepository.save(
        QueriesRepository.create({
          name: payload.name,
          isTrash: false,
          opts: payload.opts,
          team: {
            id: dataSource?.team.id,
          },
          dataSource: {
            id: payload.dataSourceId,
          }
        }),
      );

      return {
        data: query,
      };
    },
  });

  // update query
  instance.route({
    method: "patch",
    url: "/:id",
    config: {
      requireRole: atLeast(EUserTeamRole.EDITOR),
    },
    handler: async (request) => {
      const { id } = getRequestParams<{ id: string }>(request);
      const payload = getRequestPayload<TUpdateQuery>(request);
      const result = await QueriesRepository.update(id, payload);

      if (!result.affected) {
        throw new HttpError(404, "Query not found");
      }

      const query = await QueriesRepository.findOneBy({
        id,
      });

      return {
        data: query,
      };
    },
  });

  // delete query
  instance.route({
    method: "delete",
    url: "/:id",
    config: {
      requireRole: atLeast(EUserTeamRole.EDITOR),
    },
    handler: async (request) => {
      return AppDataSource.transaction(async () => {
        const { id } = getRequestParams<{ id: string }>(request);
        const result = await QueriesRepository.delete({
          id
        });

        if (!result.affected) {
          return {
            status: 404,
            data: "Query not found",
          };
        }
      });
    },
  });
});
