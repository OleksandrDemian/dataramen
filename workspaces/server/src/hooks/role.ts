import {onRequestHookHandler} from "fastify";
import {HttpError} from "../utils/httpError";
import { EUserTeamRole } from "@dataramen/types";
import { RoleWeights } from "@dataramen/common";

export type TRoleCheckFn = (currentRole: EUserTeamRole) => boolean;

export const atLeast = (minimalRole: EUserTeamRole): TRoleCheckFn => {
  const minWeight = RoleWeights[minimalRole];
  return (role: EUserTeamRole) => {
    return RoleWeights[role] >= minWeight;
  };
};

export const requestRole: onRequestHookHandler = async (request) => {
  const rolesChecker = request.routeOptions.config.requireRole;
  if (rolesChecker) {
    if (!rolesChecker(request.user.currentTeamRole)) {
      throw new HttpError(403, "You are not authorized to perform this action");
    }
  }
};
