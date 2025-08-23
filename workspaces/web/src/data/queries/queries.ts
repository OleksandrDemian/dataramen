import {useMutation, useQuery} from "react-query";
import {apiClient} from "../clients.ts";
import {queryClient} from "../queryClient.ts";
import {invalidateTeamProjectFiles, invalidateTeamTrash} from "./project.ts";
import {TCreateQuery, TFindQueryParams, TQuery, TUpdateQuery} from "@dataramen/types";
import {Analytics} from "../../utils/analytics.ts";

export const useFindQuery = (query: TFindQueryParams) => {
  return useQuery({
    queryKey: [
      "queries",
      query.dataSourceId,
      query.teamId,
      query.limit,
      query.orderBy,
      query.name,
    ],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TQuery[] }>("/queries", { params: query });
      return data.data;
    },
    staleTime: undefined,
    enabled: !!query.teamId || !!query.dataSourceId,
    keepPreviousData: true,
  });
};

export const useQueryById = (id?: string) => {
  return useQuery({
    queryKey: ["query", id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TQuery }>("/queries/" + id);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateQuery = () => {
  return useMutation({
    mutationFn: async (payload: TCreateQuery) => {
      const { data } = await apiClient.post<{ data: TQuery }>("/queries", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["queries"]);
      invalidateTeamProjectFiles();
      Analytics.event("Query created");
    }
  });
};

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
