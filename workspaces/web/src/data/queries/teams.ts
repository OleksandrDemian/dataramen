import {useMutation, useQuery} from "@tanstack/react-query";
import {apiClient} from "../clients.ts";
import {EUserTeamRole, TTeamUser} from "@dataramen/types";
import {queryClient} from "../queryClient.ts";

export const useTeamUsers = (teamId?: string) => {
  return useQuery({
    queryKey: ["team-users"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TTeamUser[] }>("/teams/" + teamId + "/users");
      return data.data;
    },
    enabled: !!teamId,
  })
};

export const useUpdateUserTeamRole = () => {
  return useMutation({
    mutationFn: async ({ role, teamId, userId }: { teamId: string; role: EUserTeamRole; userId: string }) => {
      await apiClient.patch("/teams/" + teamId + "/user-role", {
        role,
        userId,
      });
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team-users"],
      });
    }
  });
};

export const useRemoveUser = () => {
  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      await apiClient.delete("/teams/" + teamId, {
        params: {
          userId,
        },
      });
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team-users"],
      });
    },
  });
};
