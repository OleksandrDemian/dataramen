import {useMutation, useQuery} from "react-query";
import {apiClient} from "../clients.ts";
import {queryClient} from "../queryClient.ts";
import {invalidateTeamProjectFiles, invalidateTeamTrash} from "./project.ts";
import { TCreateSavedQuery, TQuery, TUpdateQuery } from "@dataramen/types";
import {Analytics} from "../../utils/analytics.ts";

export const useQueryById = (id?: string | null) => {
  return useQuery({
    queryKey: ["query", id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TQuery }>("/queries/" + id);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useSaveQuery = () => {
  return useMutation({
    mutationFn: async (payload: TCreateSavedQuery) => {
      const { data } = await apiClient.post<{ data: TQuery }>("/saved-queries", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["queries"]);
      invalidateTeamProjectFiles();
      Analytics.event("Query created");
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

export const useUpdateQuery = () => {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string, payload: Partial<TUpdateQuery> }) => {
      const { data } = await apiClient.patch<{ data: TQuery }>("/queries/" + id, payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["query", data.id]);
      invalidateTeamProjectFiles();
      invalidateTeamTrash();
      if (data.isTrash) {
        Analytics.event("Query trashed");
      } else {
        Analytics.event("Query updated");
      }
    },
  });
};
