import {createRouter} from "../../utils/createRouter";
import {getRequestParams, getRequestPayload} from "../../utils/request";
import {HttpError} from "../../utils/httpError";
import {AppDataSource, DataSourceRepository, QueriesRepository} from "../../repository/db";
import {TCreateQuery, TUpdateQuery, EUserTeamRole} from "@dataramen/types";
import {atLeast} from "../../hooks/role";

export default createRouter((instance) => {
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

  /**
   * Create saved query
   */
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
          opts: payload.opts,
          team: {
            id: dataSource?.team.id,
          },
          dataSource: {
            id: payload.dataSourceId,
          },
          user: {
            id: request.user.id,
          },
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
