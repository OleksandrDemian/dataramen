import {useInfiniteQuery, useQuery} from "@tanstack/react-query";
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

export const useTeamSavedQueries = (teamId?: string) => {
  return useQuery({
    queryKey: ['project', 'saved-queries', teamId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TProjectQuery[] }>(`/project/team/${teamId}/queries`);
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

export const useInfiniteTabHistory = (teamId?: string, resultsPerPage: number = 30, archived?: boolean) => {
  return useInfiniteQuery({
    queryKey: ['project', "tabs-history", teamId, resultsPerPage],
    queryFn: async ({ pageParam }) => {
      const filterValue = archived !== undefined ? `&archived=${archived}` : '';
      const { data } = await apiClient.get<{ data: TProjectTabsHistoryEntry[]; hasMore: boolean; }>(`/project/team/${teamId}/tabs-history?page=${pageParam}&size=${resultsPerPage}${filterValue}`);
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

export const invalidateTabsHistory = () => {
  return queryClient.invalidateQueries({
    queryKey: ['project', "tabs-history"],
  });
};
