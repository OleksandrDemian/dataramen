import {useMutation, useQuery} from "react-query";
import {apiClient} from "../clients.ts";
import {TDbValue, TExecuteInsert, TExecuteQuery, TExecuteUpdate, TRunSqlResult} from "@dataramen/types";
import {QueryFilter} from "@dataramen/sql-builder";
import {genSimpleId} from "../../utils/id.ts";

export const useTableExplorer = (props: TExecuteQuery, onSuccess?: (data: TRunSqlResult) => void) => {
  const {
    datasourceId,
    opts: {
      searchAll,
      table,
      filters,
      joins,
      orderBy,
      groupBy,
      columns,
      aggregations,
    },
    page = 0,
    size = 20
  } = props;
  return useQuery<TRunSqlResult>({
    queryKey: ["explorer", datasourceId, table, page, size, filters, aggregations, joins, orderBy, groupBy, columns, searchAll],
    queryFn: async () => {
      const { data } = await apiClient.post<{ data: TRunSqlResult }>("/runner/select", props);
      return data.data;
    },
    retry: 1,
    enabled: !!table && !!datasourceId,
    keepPreviousData: true,
    staleTime: 0,
    cacheTime: 0,
    onSuccess,
  });
};

export const useEntity = (dataSourceId?: string, table?: string, key?: [string, TDbValue][]) => {
  return useQuery<TRunSqlResult>({
    queryKey: ["entity", dataSourceId, table, key],
    queryFn: async () => {
      const filters: QueryFilter[] = key ? key.map(([column, value]) => {
        return {
          id: genSimpleId(),
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
        opts: {
          // todo: create dedicated endpoint to extract entity by id
          table: table!,
          filters,
          joins: [],
          columns: [],
          orderBy: [],
          groupBy: [],
          aggregations: [],
        },
        size: 1,
        page: 0,
        name: `Select ${table}: [${key?.join()}]`,
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
