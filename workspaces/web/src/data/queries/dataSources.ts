import {useMutation, useQuery} from "@tanstack/react-query";
import {apiClient} from "../clients.ts";
import {
  TCreateDataSource,
  TDatabaseInspection,
  TDataSource,
  TDataSourceID,
  TDataSourceWOwner,
} from "../types/dataSources.ts";
import {queryClient} from "../queryClient.ts";
import {QUERY_DATASOURCE_KEY} from "../keysConst.ts";
import {invalidateTeamProjectFiles} from "./project.ts";
import {Analytics} from "../../utils/analytics.ts";

export const useDataSource = (id?: string) => {
  return useQuery({
    queryKey: [QUERY_DATASOURCE_KEY, id],
    queryFn: async () => {
      const {data} = await apiClient.get<{ data: TDataSource }>("/data-sources/" + id);
      return data.data;
    },
    enabled: !!id,
  });
};

export type TFindDataSourcesQuery = {
  teamId?: string;
};
export const useDataSources = (query: TFindDataSourcesQuery) => {
  return useQuery({
    queryKey: [
      QUERY_DATASOURCE_KEY,
      query.teamId,
    ],
    queryFn: async () => {
      const {data} = await apiClient.get<{ data: TDataSourceWOwner[] }>("/data-sources", {
        params: query,
      });
      return data.data;
    },
    enabled: query.teamId !== undefined,
  });
};

export const useDatabaseInspections = (dsId?: string) => {
  return useQuery({
    queryKey: [QUERY_DATASOURCE_KEY , dsId, "inspections"], // same query key as hooks.useHooks
    queryFn: async () => {
      const {data} = await apiClient.get<{ data: TDatabaseInspection[] }>(`/data-sources/${dsId}/inspections`);
      return data.data;
    },
    enabled: !!dsId,
  });
};

export const useCreateDataSource = () => {
  return useMutation({
    mutationFn: async (dataSource: TCreateDataSource) => {
      const {data} = await apiClient.post<{ data: TDataSource }>("/data-sources", dataSource);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_DATASOURCE_KEY],
      });
      invalidateTeamProjectFiles();
      Analytics.event("Datasource created");
    },
    onError: () => {
      Analytics.event("Datasource creation failed");
    },
  });
};

// patch
export const useUpdateDataSource = () => {
  return useMutation({
    mutationFn: async ({ dataSource, id }: { dataSource: Partial<TDataSource>, id: string }) => {
      const {data} = await apiClient.put<{ data: TDataSource }>(`/data-sources/${id}`, dataSource);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_DATASOURCE_KEY],
      });
      invalidateTeamProjectFiles();
    },
  });
};

export const useManualInspectDataSource = () => {
  return useMutation({
    mutationFn: async (id: TDataSourceID) => {
      await apiClient.post(`/data-sources/${id}/inspect`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_DATASOURCE_KEY],
      });
      Analytics.event("Datasource inspected");
    }
  });
};

export const useDeleteDataSource = () => {
  return useMutation({
    mutationFn: async (id: TDataSourceID) => {
      await apiClient.delete(`/data-sources/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_DATASOURCE_KEY],
      });
      invalidateTeamProjectFiles();
      Analytics.event("Datasource deleted");
    },
  });
}
