import { createRouter } from "../../utils/createRouter";
import { getRequestParams, getRequestPayload } from "../../utils/request";
import {AppDataSource, QueriesRepository, SavedQueriesRepository} from "../../repository/db";
import {EUserTeamRole, TCreateSavedQuery, TUpdateQuery} from "@dataramen/types";
import { atLeast } from "../../hooks/role";
import {generateSearchString} from "../../utils/generateSearchString";
import {HttpError} from "../../utils/httpError";

export default createRouter((instance) => {
  instance.route({
    method: "post",
    url: "/",
    config: {
      requireRole: atLeast(EUserTeamRole.EDITOR),
    },
    handler: async (request) => {
      const payload = getRequestPayload<TCreateSavedQuery>(request);
      const query = await QueriesRepository.findOne({
        where: {
          id: payload.queryId,
        }
      });

      if (!query) {
        throw new HttpError(400, "Query not found");
      }

      const savedQuery = await SavedQueriesRepository.save(
        SavedQueriesRepository.create({
          isPersonal: false,
          team: {
            id: request.user.currentTeamId,
          },
          user: {
            id: request.user.id,
          },
          query: {
            id: payload.queryId,
          },
          searchString: generateSearchString(query.opts, payload.name),
        }),
      );

      // update query name
      await QueriesRepository.update(payload.queryId, {
        name: payload.name,
      });

      return {
        data: savedQuery,
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
      const { id } = getRequestParams<{ id: string }>(request);
      const result = await SavedQueriesRepository.delete({
        id
      });

      if (!result.affected) {
        return {
          status: 404,
          data: "Query not found",
        };
      }
    },
  });

  instance.route({
    method: "patch",
    url: "/:id",
    handler: async (request) => {
      return await AppDataSource.transaction(async () => {
        const { id } = getRequestParams<{ id: string }>(request);
        const payload = getRequestPayload<{ name: string }>(request, (payload) => {
          if (!payload.name) {
            throw new HttpError(400, "Name is required");
          }
        });

        const savedQuery = await SavedQueriesRepository.findOne({
          where: {
            id: id,
          },
          relations: {
            query: true,
          },
        });

        if (!savedQuery) {
          throw new HttpError(400, "Query not found");
        }

        const searchString = generateSearchString(savedQuery.query.opts, payload.name);
        await Promise.all([
          SavedQueriesRepository.update({ id }, {
            searchString,
          }),
          QueriesRepository.update({ id: savedQuery.query.id }, {
            name: payload.name,
          }),
        ]);

        return {
          data: true,
        };
      });
    },
  });
});
