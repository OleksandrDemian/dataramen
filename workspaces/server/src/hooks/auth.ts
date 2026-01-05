import {FastifyRequest, onRequestHookHandler} from 'fastify';
import {verifyAccessToken} from "../services/auth";
import {HttpError} from "../utils/httpError";
import {UserRepository, UsersToTeamsRepository} from "../repository/db";
import {modeConfig} from "../config/modeConfig";
import {EUserTeamRole} from "@dataramen/types";

const isPublicRoute = (req: FastifyRequest): boolean => {
  if (req.routeOptions.config.isPublic) {
    return true;
  }

  // API routes by default are private, unless marked as isPublic in routeOptions
  // non API routes are by default public
  return !req.url.startsWith("/api/");
};

const getOwner = async () => {
  return UsersToTeamsRepository.findOne({
    where: {
      role: EUserTeamRole.OWNER,
    },
    relations: {
      user: true,
      team: true,
    }
  })
}

const authenticateLocalUser = async (request: FastifyRequest) => {
  const existingOwner = await getOwner();

  if (!existingOwner) {
    throw new HttpError(401, "User is not part of a team");
  }

  request.user = {
    id: existingOwner.user.id,
    currentTeamId: existingOwner.team.id,
    currentTeamRole: existingOwner.role,
  };
};

const authenticatePublicUser = async (request: FastifyRequest) => {
  const authorization = request.headers.authorization;
  if (!authorization) {
    throw new HttpError(401, "Missing auth token");
  }

  const [_, accessToken] = authorization.split(' ');

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
    throw new HttpError(401, "Unauthorized");
  }

  request.user = {
    id: userId,
    currentTeamId: user.currentTeam.team.id,
    currentTeamRole: user.currentTeam.role,
  };
};

export const requestAuthHook: onRequestHookHandler = async (request) => {
  if (isPublicRoute(request)) return; // Skip auth for public routes

  if (modeConfig.skipAuth) {
    await authenticateLocalUser(request);
  } else {
    await authenticatePublicUser(request);
  }
};
