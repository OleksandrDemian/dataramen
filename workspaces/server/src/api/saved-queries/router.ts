import { createRouter } from "../../utils/createRouter";
import { getRequestParams, getRequestPayload } from "../../utils/request";
import {AppDataSource, QueriesRepository, SavedQueriesRepository} from "../../repository/db";
import { EUserTeamRole, TCreateSavedQuery } from "@dataramen/types";
import { atLeast } from "../../hooks/role";

export default createRouter((instance) => {
  /**
   * Create saved query, save query
   */
  instance.route({
    method: "post",
    url: "/",
    config: {
      requireRole: atLeast(EUserTeamRole.EDITOR),
    },
    handler: async (request) => {
      const payload = getRequestPayload<TCreateSavedQuery>(request);
      const savedQuery = await SavedQueriesRepository.save(
        SavedQueriesRepository.create({
          isPersonal: true,
          team: {
            id: request.user.currentTeamId,
          },
          user: {
            id: request.user.id,
          },
          query: {
            id: payload.queryId,
          },
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
});
