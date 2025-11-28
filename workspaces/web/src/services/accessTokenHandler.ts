import {apiClientNoAuth} from "../data/clients.ts";
import {TAuthUser, TAuthUserParams} from "@dataramen/types";
import {readAccessToken, storeAccessToken} from "../utils/sessionAccessToken.ts";
import {queryClient} from "../data/queryClient.ts";

const fetchRefreshToken = async (): Promise<string> => {
  const { data } = await apiClientNoAuth.post<{ data: TAuthUser }>("/auth/refresh");
  return data.data.accessToken;
};

const fetchLogin = async (params: TAuthUserParams): Promise<string> => {
  const { data } = await apiClientNoAuth.post<{ data: TAuthUser }>("/auth/login", params);
  return data.data.accessToken;
};

export const triggerAccessTokenUpdate = () => {
  queryClient.invalidateQueries({
    queryKey: ["accessToken"],
  });
};

export const AccessTokenHandler = (() => {
  let accessTokenPromise: Promise<string | undefined> = Promise.resolve(readAccessToken());
  let isFetching: boolean = false;

  const logout = async (): Promise<void> => {
    await apiClientNoAuth.post("/auth/logout");
    storeAccessToken(undefined);

    // refresh page, ask to login
    window.location.reload();
  };

  const refresh = () => {
    if (isFetching) {
      return accessTokenPromise;
    }

    isFetching = true;
    accessTokenPromise = fetchRefreshToken()
      .then((accessToken) => {
        // gon new access token, store it in local storage
        storeAccessToken(accessToken);
        return accessToken;
      })
      .catch(() => {
        // failed to refresh token, logout user
        storeAccessToken(undefined);
        logout();
        return undefined;
      })
      .finally(() => {
        isFetching = false;
        triggerAccessTokenUpdate();
      });

    return accessTokenPromise;
  };

  const get = async (): Promise<string | undefined> => {
    return accessTokenPromise;
  };

  const login = (params: TAuthUserParams) => {
    if (isFetching) {
      return accessTokenPromise;
    }

    isFetching = true;
    accessTokenPromise = fetchLogin(params)
      .then((accessToken) => {
        storeAccessToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        isFetching = false;
        triggerAccessTokenUpdate();
      });
    return accessTokenPromise;
  };

  return {
    get: get,
    refresh: refresh,
    login: login,
    logout: logout,
  };
})();
