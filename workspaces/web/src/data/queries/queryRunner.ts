import {useMutation, useQuery} from "@tanstack/react-query";
import {apiClient} from "../clients.ts";
import {
  TDbValue,
  TExecuteInsert,
  TExecuteUpdate,
  TExecuteGetEntityResponse,
  TRunSqlResult,
} from "@dataramen/types";

export const useEntity = (dataSourceId?: string, table?: string, key?: [string, TDbValue][]) => {
  return useQuery<TExecuteGetEntityResponse>({
    queryKey: ["entity", dataSourceId, table, key],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TExecuteGetEntityResponse }>(`/runner/${dataSourceId}/entity/${table}`, {
        params: key?.reduce(
          (acc, val) => {
            acc[val[0]] = val[1];
            return acc;
          }, {} as Record<string, TDbValue>
        ),
      });

      return data.data;
    },
    retry: 1,
    enabled: !!table && !!dataSourceId && !!key,
    staleTime: 0,
  });
};

export const useUpdate = () => {
  return useMutation({
    mutationFn: async (props: TExecuteUpdate) => {
      const { data } = await apiClient.post<{ data: TRunSqlResult }>(`/runner/${props.datasourceId}/update`, props);

      return data.data;
    },
  });
};

export const useInsert = () => {
  return useMutation({
    mutationFn: async (props: TExecuteInsert) => {
      const { data } = await apiClient.post<{ data: TRunSqlResult }>(`/runner/${props.datasourceId}/insert`, props);

      return data.data;
    },
  });
};
