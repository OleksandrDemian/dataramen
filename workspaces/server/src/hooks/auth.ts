import {FastifyRequest, onRequestHookHandler} from 'fastify';
import {verifyAccessToken} from "../services/auth";
import {HttpError} from "../utils/httpError";
import {UsersToTeamsRepository} from "../repository/db";

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
    const user = await UsersToTeamsRepository.findOneBy({
      user: {
        id: userId,
      }
    });

    if (!user) {
      throw new HttpError(401, "User is not part of a team");
    }

    request.user = {
      id: userId,
      currentTeamRole: user.role,
    };
  } catch (err) {
    throw new HttpError(401, "Unauthorized");
  }
};
