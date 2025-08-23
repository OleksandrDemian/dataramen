import {useMutation, useQuery} from "react-query";
import {apiClient} from "../clients.ts";
import {queryClient} from "../queryClient.ts";
import {QUERY_AUTH_USER_KEY} from "../keysConst.ts";
import {AxiosError, isAxiosError} from "axios";
import {IUser, TCreateUser, TUser} from "@dataramen/types";
import {AccessTokenHandler} from "../../services/accessTokenHandler.ts";

export const useAccessToken = () => {
  return useQuery(["accessToken"], AccessTokenHandler.get);
};

export const useCurrentUser = () => {
  const { data } = useAccessToken();
  return useQuery({
    queryKey: [QUERY_AUTH_USER_KEY],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TUser }>("/users");
      return data.data;
    },
    enabled: !!data,
    retry: (failureCount, error) => {
      if (isAxiosError(error)) {
        if (error.code === "ERR_NETWORK") {
          // no server connection
          return false;
        }
      }

      return failureCount < 3;
    }
  });
};

export const useUpdateUser = () => {
  return useMutation<TUser, AxiosError, Partial<IUser>>({
    mutationFn: async (user) => {
      const { data } = await apiClient.patch<{ data: TUser }>("/users", user);
      return data.data;
    },
    onSuccess: async (data) => {
      queryClient.setQueryData([QUERY_AUTH_USER_KEY], data);
    },
  });
};

export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (user: TCreateUser) => {
      await apiClient.post("/users", user);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team-users"],
      });
    },
  });
};
