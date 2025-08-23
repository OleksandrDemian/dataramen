import {EUserTeamRole} from "@dataramen/types";
import {RoleWeights} from "@dataramen/common";
import {useCurrentUser} from "../data/queries/users.ts";
import {useMemo} from "react";

export const useRequireRole = (role: EUserTeamRole): boolean => {
  const { data: user } = useCurrentUser();

  return useMemo<boolean>(() => {
    if (!user) {
      return false;
    }

    return RoleWeights[user.teamRole] >= RoleWeights[role];
  }, [user, role])
}
