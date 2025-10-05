import {TDynamicConnection} from "../services/connectorManager/types";
import {TRoleCheckFn} from "../hooks/role";
import {EUserTeamRole} from "@dataramen/types";

export type TFastifyUser = {
  id: string;
  currentTeamId: string;
  currentTeamRole: EUserTeamRole;
};

declare module "fastify" {
  interface FastifyRequest {
    // create a global request value to store the connection manager
    __connections?: TDynamicConnection[];
    user: TFastifyUser;
  }

  interface FastifyContextConfig {
    isPublic?: boolean;
    requireRole?: TRoleCheckFn;
  }
}
