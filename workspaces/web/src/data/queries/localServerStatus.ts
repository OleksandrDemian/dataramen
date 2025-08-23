import {useQuery} from "react-query";
import {apiClientNoAuth} from "../clients.ts";
import {queryClient} from "../queryClient.ts";
import {QUERY_AUTH_USER_KEY} from "../keysConst.ts";
import {TUser} from "@dataramen/types";

type TPingResult = {
  active: boolean;
  version: string;
};
const INACTIVE_DATA: TPingResult = {
  active: false,
  version: "",
};

export async function pingServer (): Promise<TPingResult> {
  try {
    const { data } = await apiClientNoAuth.get(`/status`, {
      timeout: 500,
      validateStatus: () => true,
    });

    return data?.data || INACTIVE_DATA;
  } catch (_: unknown) {
    return INACTIVE_DATA;
  }
}

function handleActiveState () {
  const state = queryClient.getQueryState<TUser>([QUERY_AUTH_USER_KEY]);
  if (state?.status === "error") {
    // try to refetch user data to enable app
    queryClient.invalidateQueries({
      queryKey: [QUERY_AUTH_USER_KEY],
    });
  }
}

function handleDisabledState () {
  const state = queryClient.getQueryState<TUser>([QUERY_AUTH_USER_KEY]);
  if (state?.status === "success") {
    // try to refetch user data to enable app
    queryClient.resetQueries({
      queryKey: [QUERY_AUTH_USER_KEY],
    });
  }
}

export const useLocalServerStatus = () => useQuery({
  queryKey: ["server-status"],
  queryFn: pingServer,
  onSuccess: ({ active }: TPingResult) => {
    if (active) {
      handleActiveState();
    } else {
      handleDisabledState();
    }
  },
  refetchOnWindowFocus: true,
  refetchInterval: (_, query) => {
    if (query?.state?.data?.active) {
      // we have an active server, poll less frequently
      return 20_000; // 20 seconds
    }

    // local server not active, poll more frequently
    return 4_000; // 4 seconds
  },
  retry: false,
});
