import {useMutation, useQuery} from "@tanstack/react-query";
import {apiClient} from "../clients.ts";
import {
  TCreateDataSource,
  TDatabaseInspection,
  TDataSourceID,
  TDataSourceWOwner,
} from "../types/dataSources.ts";
import {queryClient} from "../queryClient.ts";
import {QUERY_DATASOURCE_KEY} from "../keysConst.ts";
import {invalidateTeamProjectFiles} from "./project.ts";
import { IDataSource } from "@dataramen/types";

const REFETCH_INTERVAL = 4_000;

export const useDataSource = (id?: string) => {
  return useQuery({
    queryKey: [QUERY_DATASOURCE_KEY, id],
    queryFn: async () => {
      const {data} = await apiClient.get<{ data: IDataSource }>("/data-sources/" + id);
      return data.data;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      if (query.state?.data?.status === "INSPECTING") {
        // if inspecting, refetch every 4s
        return REFETCH_INTERVAL;
      }

      return false;
    },
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

export const invalidateDatabaseInspections = (dsId: string) => {
  return queryClient.invalidateQueries({
    queryKey: [QUERY_DATASOURCE_KEY, dsId, "inspections"],
  });
};

export const useCreateDataSource = () => {
  return useMutation({
    mutationFn: async (dataSource: TCreateDataSource) => {
      const {data} = await apiClient.post<{ data: IDataSource }>("/data-sources", dataSource);
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

// patch
export const useUpdateDataSource = () => {
  return useMutation({
    mutationFn: async ({ dataSource, id }: { dataSource: Partial<IDataSource>, id: string }) => {
      const {data} = await apiClient.put<{ data: IDataSource }>(`/data-sources/${id}`, dataSource);
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_DATASOURCE_KEY, variables],
      });
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
    },
  });
}
