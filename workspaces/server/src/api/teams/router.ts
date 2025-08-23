import {createRouter} from "../../utils/createRouter";
import {getRequestParams, getRequestPayload, getRequestQuery} from "../../utils/request";
import {AppDataSource, TeamRepository, UserRepository, UsersToTeamsRepository} from "../../repository/db";
import {EUserTeamRole, ITeamSchema, TTeamUser} from "@dataramen/types";
import {HttpError} from "../../utils/httpError";
import {atLeast} from "../../hooks/role";

export default createRouter((instance) => {
  instance.route({
    method: "get",
    url: "/:id/users",
    handler: async (request): Promise<{ data: TTeamUser[] }> => {
      const { id } = getRequestParams<{ id: string }>(request);

      const teamWithUsers = await TeamRepository.findOne({
        where: {
          id,
        },
        relations: {
          users: {
            user: true,
          },
        },
      });

      if (!teamWithUsers) {
        throw new HttpError(404, "Team not found");
      }

      return {
        data: teamWithUsers.users.map((user) => ({
          role: user.role,
          id: user.user.id,
          name: user.user.username,
        })),
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
      return AppDataSource.transaction(async () => {
        const userId = request.user.id;
        const teamPayload = getRequestPayload<ITeamSchema>(request);

        const user = UserRepository.create();
        user.id = userId;

        const team = TeamRepository.create(teamPayload);
        await TeamRepository.save(team);

        const join = UsersToTeamsRepository.create({
          user,
          team,
        });

        await UsersToTeamsRepository.save(join);

        return {
          data: team,
        };
      });
    },
  });

  instance.route({
    method: "patch",
    url: "/:id/user-role",
    config: {
      requireRole: atLeast(EUserTeamRole.ADMIN),
    },
    handler: async (request) => {
      const { id } = getRequestParams<{ id: string; }>(request);
      const { role, userId } = getRequestPayload<{ userId: string; role: EUserTeamRole }>(request, ({ role }) => {
        if (role === EUserTeamRole.OWNER) throw new HttpError(400, "Only one owner is allowed");
      });

      const currentUser = await UsersToTeamsRepository.findOneBy({
        user: {
          id: userId
        },
        team: {
          id,
        },
      });

      if (currentUser?.role === EUserTeamRole.OWNER) {
        throw new HttpError(400, "Cannot change owner role");
      }

      await UsersToTeamsRepository.update({
        user: {
          id: userId,
        },
        team: {
          id: id
        }
      }, {
        role,
      });
    },
  });

  /**
   * This endpoint remove both user <-> team join and user entity.
   * This is because for now each server only supports 1 team, so we can safely assume that removed user is not used anymore.
   * This will change in the future when DataRamen will allow multiple teams for each server
   */
  instance.route({
    method: "delete",
    url: "/:id",
    config: {
      requireRole: atLeast(EUserTeamRole.ADMIN),
    },
    handler: async (request) => {
      return AppDataSource.transaction(async () => {
        const { id } = getRequestParams<{ id: string; }>(request);
        const { userId } = getRequestQuery<{ userId: string; }>(request);

        const currentUser = await UsersToTeamsRepository.findOneBy({
          user: {
            id: userId
          },
          team: {
            id,
          },
        });

        if (currentUser?.role === EUserTeamRole.OWNER) {
          throw new HttpError(400, "Cannot delete team owner");
        }

        // remove user -> current team pointer
        await UserRepository.update(userId, {
          currentTeam: null!,
        });

        // remove join record
        await UsersToTeamsRepository.delete({
          user: {
            id: userId,
          },
          team: {
            id: id
          },
        });

        // currently we only have 1 team per server, so we can remove user right after removing the join
        await UserRepository.delete({
          id: userId,
        });
      });
    },
  });
});
