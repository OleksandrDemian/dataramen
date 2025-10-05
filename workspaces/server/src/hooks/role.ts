import {onRequestHookHandler} from "fastify";
import {HttpError} from "../utils/httpError";
import { EUserTeamRole } from "@dataramen/types";
import { RoleWeights } from "@dataramen/common";
import {TFastifyUser} from "../types/extendFastify";

export type TRoleCheckFn = (currentRole: TFastifyUser) => boolean;

export const atLeast = (minimalRole: EUserTeamRole): TRoleCheckFn => {
  const minWeight = RoleWeights[minimalRole];
  return (user: TFastifyUser) => {
    return RoleWeights[user.currentTeamRole] >= minWeight;
  };
};

export const requestRole: onRequestHookHandler = async (request) => {
  const rolesChecker = request.routeOptions.config.requireRole;
  if (rolesChecker) {
    if (!rolesChecker(request.user)) {
      throw new HttpError(403, "You are not authorized to perform this action");
    }
  }
};
