import {useMutation} from "@tanstack/react-query";
import {apiClient} from "../clients.ts";
import {queryClient} from "../queryClient.ts";
import {invalidateTeamProjectFiles, invalidateTeamTrash} from "./project.ts";
import { TCreateSavedQuery, TQuery, TUpdateQuery } from "@dataramen/types";

export const useSaveQuery = () => {
  return useMutation({
    mutationFn: async (payload: TCreateSavedQuery) => {
      const { data } = await apiClient.post<{ data: TQuery }>("/saved-queries", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["queries"],
      });
      invalidateTeamProjectFiles();
    }
  });
};

export const useDeleteSavedQuery = () => {
  return useMutation({
    mutationFn: async (savedQueryId: string) => apiClient.delete("/saved-queries/" + savedQueryId),
    onSuccess: () => {
      invalidateTeamProjectFiles();
    },
  });
}

export const useUpdateSavedQuery = () => {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string, payload: Partial<TUpdateQuery> }) => {
      const { data } = await apiClient.patch("/saved-queries/" + id, payload);
      return data.data;
    },
    onSuccess: () => {
      invalidateTeamProjectFiles();
      invalidateTeamTrash();
    },
  });
};
