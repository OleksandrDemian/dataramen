import {useMutation, useQuery} from "react-query";
import {apiClient} from "../clients.ts";
import {TDbValue, TExecuteInsert, TExecuteQuery, TExecuteUpdate, TRunSqlResult} from "@dataramen/types";
import {QueryFilter} from "@dataramen/sql-builder";

export const useTableExplorer = ({
  searchAll,
  table,
  datasourceId,
  filters,
  joins,
  orderBy,
  groupBy,
  columns,
  page = 0,
  size = 20
}: TExecuteQuery) => {
  return useQuery<TRunSqlResult>({
    queryKey: ["explorer", datasourceId, table, page, size, filters, joins, orderBy, groupBy, columns, searchAll],
    queryFn: async () => {
      const { data } = await apiClient.post<{ data: TRunSqlResult }>("/runner/select", {
        datasourceId: datasourceId!,
        table: table!,
        filters,
        joins,
        orderBy,
        page,
        size,
        columns,
        groupBy,
        searchAll,
      } satisfies TExecuteQuery);
      return data.data;
    },
    retry: 1,
    enabled: !!table && !!datasourceId,
    keepPreviousData: true,
    staleTime: 0,
    cacheTime: 0,
  });
};

export const useEntity = (dataSourceId?: string, table?: string, key?: [string, TDbValue][]) => {
  return useQuery<TRunSqlResult>({
    queryKey: ["entity", dataSourceId, table, key],
    queryFn: async () => {
      const filters: QueryFilter[] = key ? key.map(([column, value]) => {
        return {
          column,
          operator: "=",
          value: [{
            value,
          }],
          connector: "AND"
        } satisfies QueryFilter;
      }) : [];

      const { data } = await apiClient.post<{ data: TRunSqlResult }>("/runner/select", {
        datasourceId: dataSourceId!,
        table: table!,
        filters,
        size: 1,
        page: 0,
      } satisfies TExecuteQuery);

      return data.data;
    },
    retry: 1,
    enabled: !!table && !!dataSourceId && !!key,
    staleTime: 0,
    cacheTime: 0,
  });
};

export const useUpdate = () => {
  return useMutation({
    mutationFn: async (props: TExecuteUpdate) => {
      const { data } = await apiClient.post<{ data: TRunSqlResult }>(`/runner/update`, props);

      return data.data;
    },
  });
};

export const useInsert = () => {
  return useMutation({
    mutationFn: async (props: TExecuteInsert) => {
      const { data } = await apiClient.post<{ data: TRunSqlResult }>(`/runner/insert`, props);

      return data.data;
    },
  });
};
