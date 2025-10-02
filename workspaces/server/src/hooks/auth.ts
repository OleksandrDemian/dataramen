import {FastifyRequest, onRequestHookHandler} from 'fastify';
import {verifyAccessToken} from "../services/auth";
import {HttpError} from "../utils/httpError";
import {UserRepository, UsersToTeamsRepository} from "../repository/db";

const skipAuth = (req: FastifyRequest): boolean => {
  if (req.routeOptions.config.isPublic) {
    return true;
  }

  return !req.url.startsWith("/api/");
}

export const requestAuthHook: onRequestHookHandler = async (request) => {
  if (skipAuth(request)) return; // Skip auth for public routes

  const authorization = request.headers.authorization;
  if (!authorization) {
    throw new HttpError(401, "Missing auth token");
  }

  const [_, accessToken] = authorization.split(' ');

  try {
    const { userId } = await verifyAccessToken(accessToken);
    const user = await UserRepository.findOne({
      where: {
        id: userId,
      },
      select: {
        id: true,
        currentTeam: {
          role: true,
          team: {
            id: true,
          },
        },
      },
      relations: {
        currentTeam: {
          team: true,
        },
      },
    });

    if (!user) {
      throw new HttpError(401, "User is not part of a team");
    }

    request.user = {
      id: userId,
      currentTeamId: user.currentTeam.team.id,
      currentTeamRole: user.currentTeam.role,
    };
  } catch (err) {
    throw new HttpError(401, "Unauthorized");
  }
};
