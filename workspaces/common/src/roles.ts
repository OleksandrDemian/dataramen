import { EUserTeamRole } from "@dataramen/types";

export const RoleWeights: Record<EUserTeamRole, number> = {
  [EUserTeamRole.READ_ONLY]: 10,
  [EUserTeamRole.EDITOR]: 20,
  [EUserTeamRole.ADMIN]: 30,
  [EUserTeamRole.OWNER]: 40,
};
