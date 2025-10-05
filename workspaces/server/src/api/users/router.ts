import {createRouter} from "../../utils/createRouter";
import {getRequestPayload} from "../../utils/request";
import {HttpError} from "../../utils/httpError";
import {AppDataSource, UserRepository, UsersToTeamsRepository} from "../../repository/db";
import {EUserTeamRole, IUser, TCreateUser, TUser} from "@dataramen/types";
import {hashPassword} from "../../utils/passwordHash";
import {atLeast} from "../../hooks/role";

export default createRouter((instance) => {
  // get user
  instance.route({
    method: "get",
    url: "/",
    handler: async (req): Promise<{ data: TUser }> => {
      const user = await UserRepository.findOne({
        where: {
          id: req.user.id,
        },
        relations: {
          currentTeam: {
            team: true,
          },
        }
      });

      if (!user) {
        throw new HttpError(404, "User not found");
      }

      return {
        data: {
          id: user.id!,
          teamId: user.currentTeam?.team.id!,
          teamName: user.currentTeam?.team.name!,
          teamRole: user.currentTeam?.role!,
          username: user.username!,
        },
      };
    },
  });

  // update user
  instance.route({
    method: "patch",
    url: "/",
    handler: async (request): Promise<{ data: TUser }> => {
      const userId = request.user.id;
      const payload = getRequestPayload<Partial<IUser>>(request);

      if (payload.password) {
        payload.password = await hashPassword(payload.password);
      }

      const result = await UserRepository.update(userId, payload);

      if (!result.affected) {
        throw new HttpError(404, "User not found");
      }

      const user = await UserRepository.findOne({
        where: {
          id: userId,
        },
        relations: {
          currentTeam: {
            team: true,
          },
        }
      });

      return {
        data: {
          id: user?.id!,
          teamId: user?.currentTeam?.team.id!,
          teamName: user?.currentTeam?.team.name!,
          teamRole: user?.currentTeam?.role!,
          username: user?.username!,
        },
      };
    },
  });

  instance.route({
    method: "post",
    url: "/",
    config: {
      requireRole: atLeast(EUserTeamRole.ADMIN),
    },
    handler: async (request) => {
      return AppDataSource.transaction(async () => {
        const body = getRequestPayload<TCreateUser>(request);

        const pwd = await hashPassword(body.password);
        const user = await UserRepository.save(
          UserRepository.create({
            username: body.username,
            password: pwd,
          }),
        );

        const userTeamJoin = await UsersToTeamsRepository.save(
          UsersToTeamsRepository.create({
            role: EUserTeamRole.READ_ONLY,
            team: {
              id: body.teamId,
            },
            user: {
              id: user.id,
            }
          }),
        );

        await UserRepository.update(user.id, {
          currentTeam: {
            id: userTeamJoin.id,
          },
        });
      });
    }
  })
});
