import {useInfiniteQuery, useMutation, useQuery} from "@tanstack/react-query";
import {apiClient} from "../clients.ts";
import {queryClient} from "../queryClient.ts";
import {TFindQuery, TProjectDataSource, TProjectQuery, TProjectTabsHistoryEntry} from "@dataramen/types";

export const useTeamDataSources = (teamId?: string) => {
  return useQuery({
    queryKey: ['project', 'datasources', teamId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TProjectDataSource[] }>(`/project/team/${teamId}/datasources`);
      return data.data;
    },
    enabled: !!teamId,
  });
};

export const invalidateTeamProjectFiles = (teamId?: string) => {
  const datasourcesQueryKey = ['project', 'datasources'];
  const queriesQueryKey = ['project', 'saved-queries'];

  if (teamId) {
    datasourcesQueryKey.push(teamId);
    queriesQueryKey.push(teamId);
  }

  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: datasourcesQueryKey,
    }),
    queryClient.invalidateQueries({
      queryKey: queriesQueryKey,
    }),
  ]);
};

export const invalidateTeamTrash = (teamId?: string) => {
  const queryKey = ['trash', 'team'];
  if (teamId) {
    queryKey.push(teamId);
  }
  return queryClient.invalidateQueries({
    queryKey: queryKey,
  });
};

export const useSearchQueries = (search: string, props: {
  teamId?: string;
  selectedDataSources?: string[];
}) => {
  return useQuery({
    queryKey: ['project', props.teamId, 'tables', search, props.selectedDataSources],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TFindQuery[] }>(`/project/team/${props.teamId}/query`, {
        params: {
          size: 30,
          search,
          selectedDataSources: props.selectedDataSources,
        },
      });
      return data.data;
    },
    enabled: !!props.teamId,
    staleTime: 0,
  });
};

export const useInfiniteTabHistory = (teamId?: string, filter: string = "", size: number = 30, archived?: boolean) => {
  return useInfiniteQuery({
    queryKey: ['project', "tabs-history", teamId, size, archived, filter],
    queryFn: async ({ pageParam }) => {
      const queryParams = new URLSearchParams();
      queryParams.set("nameFilter", filter);
      queryParams.set("size", size.toString());
      queryParams.set("page", pageParam.toString());
      if (archived !== undefined) {
        queryParams.set("archived", archived.toString());
      }

      const { data } = await apiClient.get<{ data: TProjectTabsHistoryEntry[]; hasMore: boolean; }>(`/project/team/${teamId}/tabs-history?${queryParams.toString()}`);
      return data;
    },
    select: ({ pages }) => {
      return pages.flatMap((f) => f.data);
    },
    enabled: !!teamId,
    initialPageParam: 0,
    getNextPageParam: (response, allPages) => {
      if (response.hasMore) {
        return allPages.length;
      }

      return undefined;
    },
    staleTime: 0,
  });
};

export const useTeamSavedQueries = (teamId?: string, nameFilter: string = '', size: number = 20) => {
  return useInfiniteQuery({
    queryKey: ['project', 'saved-queries', teamId, nameFilter, size],
    queryFn: async ({ pageParam }) => {
      const queryParams = new URLSearchParams();
      queryParams.set("nameFilter", nameFilter);
      queryParams.set("size", size.toString());
      queryParams.set("page", pageParam.toString());
      const { data } = await apiClient.get<{ data: TProjectQuery[]; hasMore: boolean; }>(`/project/team/${teamId}/queries?${queryParams.toString()}`);
      return data;
    },
    enabled: !!teamId,
    initialPageParam: 0,
    select: ({ pages }) => {
      return pages.flatMap((f) => f.data);
    },
    getNextPageParam: (response, allPages) => {
      if (response.hasMore) {
        return allPages.length;
      }

      return undefined;
    },
  });
};

export const useRecentTabs = (teamId?: string, resultsPerPage: number = 10, archived: boolean = false) => {
  return useQuery({
    queryKey: ['project', "recent-tabs", teamId, resultsPerPage, archived],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TProjectTabsHistoryEntry[]; hasMore: boolean; }>(`/project/team/${teamId}/tabs-history?page=0&size=${resultsPerPage}&archived=${archived}`);
      return data.data;
    },
    enabled: !!teamId,
    staleTime: 0,
  });
};

export const useFetchLastTab = (teamId?: string) => {
  return useMutation<TProjectTabsHistoryEntry | undefined>({
    mutationFn: async () => {
      const { data } = await apiClient.get<{ data: TProjectTabsHistoryEntry[]; hasMore: boolean; }>(`/project/team/${teamId}/tabs-history?page=0&size=${1}&archived=${false}`);
      return data.data?.length ? data.data[0] : undefined;
    },
  });
};

export const useCountQueries = (teamId?: string) => {
  return useQuery({
    queryKey: ["project", "count-saved-queries", teamId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: number }>(`/project/team/${teamId}/count-saved-queries`);
      return data.data;
    },
  });
};

export const invalidateTabsHistory = () => {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: ['project', "tabs-history"],
    }),
    queryClient.invalidateQueries({
      queryKey: ['project', "recent-tabs"],
    }),
  ]);
};

export const invalidateCountSavedQueries = () => {
  return queryClient.invalidateQueries({
    queryKey: ["project", "count-saved-queries"],
  })
};
