import {useMutation, useQuery} from "react-query";
import {apiClient} from "../clients.ts";
import {
  IWorkbenchTab,
  TCreateWorkbenchTab,
  TGetWorkbenchTabsEntry,
  TRunWorkbenchQuery, TUpdateWorkbenchTab, TWorkbenchOptions
} from "@dataramen/types";
import {queryClient} from "../queryClient.ts";
import {invalidateTabsHistory} from "./project.ts";

const updateCachedWorkbenchTabs = (fn: (store: TGetWorkbenchTabsEntry[]) => TGetWorkbenchTabsEntry[]) => {
  queryClient.setQueryData<TGetWorkbenchTabsEntry[]>(
    ["workbench-tabs"],
    (store) => fn(store || []),
  );
};

const updateCachedWorkbenchTab = (id: string, fn: (store: IWorkbenchTab) => IWorkbenchTab) => {
  queryClient.setQueryData<IWorkbenchTab | undefined>(
    ["workbench-tabs", id],
    (store) => {
      if (store) {
        return fn(store);
      }

      return store;
    },
  );
};

export const useWorkbenchTabs = () => {
  return useQuery({
    queryKey: ["workbench-tabs"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TGetWorkbenchTabsEntry[] }>("/workbench-tabs");
      return data.data;
    },
  });
};

export const useWorkbenchTab = (id: string) => {
  return useQuery({
    queryKey: ["workbench-tabs", id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: IWorkbenchTab }>(`/workbench-tabs/${id}`);
      return data.data;
    },
  });
};

export const useCreateWorkbenchTab = () => {
  return useMutation({
    mutationFn: async (payload: TCreateWorkbenchTab) => {
      const { data } = await apiClient.post<{ data: TGetWorkbenchTabsEntry }>("/workbench-tabs", payload);
      return data.data;
    },
    onSuccess: async (payload) => {
      updateCachedWorkbenchTabs(
        (state) => [...state, payload],
      );
    }
  });
};

export const useArchiveTab = () => {
  return useMutation({
    mutationFn: async (tabId: string) => {
      await apiClient.patch(`/workbench-tabs/${tabId}`, {
        archived: true,
      });
      return tabId;
    },
    onMutate: (removedTabId) => {
      updateCachedWorkbenchTabs(
        (state) => state.filter((tab) => tab.id !== removedTabId),
      );
    },
  })
};

export const useRestoreArchivedTab = () => {
  return useMutation({
    mutationFn: async (tabId: string) => {
      await apiClient.patch(`/workbench-tabs/${tabId}`, {
        archived: false,
      });
      return tabId;
    },
    onSuccess: () => invalidateWorkbenchTabs(),
  });
};

export const useUpdateWorkbenchTab = () => {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: TUpdateWorkbenchTab }) => {
      await apiClient.patch(`/workbench-tabs/${id}`, payload);
      return true;
    },
    onMutate: ({ id, payload }) => {
      updateCachedWorkbenchTab(id, (data) => ({
        ...data,
        ...payload,
      }));

      updateCachedWorkbenchTabs(
        (state) => {
          return state.map((entry) => {
            if (entry.id !== id) {
              return entry;
            }

            return {
              ...entry,
              name: payload.name || entry.name,
            }
          })
        },
      );
    },
  });
};

export const useRunWorkbenchTab = (workbenchTabId: string, props: TWorkbenchOptions) => {
  const {
    dataSourceId,
    searchAll,
    table,
    filters,
    joins,
    orderBy,
    groupBy,
    columns,
    aggregations,
    page = 0,
    size = 20
  } = props;
  return useQuery<TRunWorkbenchQuery>({
    queryKey: ["workbench-tab-runner", workbenchTabId, dataSourceId, table, page, size, filters, aggregations, joins, orderBy, groupBy, columns, searchAll],
    queryFn: async () => {
      const { data } = await apiClient.post<{ data: TRunWorkbenchQuery }>(`/workbench-tabs/${workbenchTabId}/run`, props);
      return data.data;
    },
    retry: 1,
    enabled: !!table && !!dataSourceId,
    cacheTime: 0,
    keepPreviousData: true,
  });
};

export const useDeleteWorkbenchTab = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/workbench-tabs/${id}`);
    },
    onSuccess: () => {
      invalidateWorkbenchTabs();
      invalidateTabsHistory();
    },
  });
}

export const invalidateTabData = (tabId: string) => {
  return queryClient.invalidateQueries({
    queryKey: ["workbench-tab-runner", tabId],
  });
};

export const invalidateWorkbenchTabs = () => {
  return queryClient.invalidateQueries({
    queryKey: ["workbench-tabs"],
  });
};
