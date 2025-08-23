import {useQuery} from "react-query";
import {apiClient} from "../clients.ts";
import {TProjectFile} from "../types/project.ts";
import {queryClient} from "../queryClient.ts";
import {TFindQuery} from "@dataramen/types";

export const useTeamProjectFiles = (teamId?: string) => {
  return useQuery({
    queryKey: ['project', 'team', teamId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TProjectFile[] }>(`/project/team/${teamId}/files`);
      return data.data;
    },
    enabled: !!teamId,
  });
};

export const invalidateTeamProjectFiles = (teamId?: string) => {
  const queryKey = ['project', 'team'];
  if (teamId) {
    queryKey.push(teamId);
  }
  return queryClient.invalidateQueries(queryKey);
};

export const invalidateTeamTrash = (teamId?: string) => {
  const queryKey = ['trash', 'team'];
  if (teamId) {
    queryKey.push(teamId);
  }
  return queryClient.invalidateQueries(queryKey);
};

export const useSearchQueries = (search: string, teamId?: string) => {
  return useQuery({
    queryKey: ['project', teamId, 'tables', search],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TFindQuery[] }>(`/project/team/${teamId}/query`, {
        params: {
          size: 20,
          search,
        },
      });
      return data.data;
    },
    enabled: !!teamId,
    staleTime: 0,
    keepPreviousData: true,
  })
};
