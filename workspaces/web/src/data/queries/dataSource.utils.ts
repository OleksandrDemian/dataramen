import {queryClient} from "../queryClient.ts";
import {QUERY_AUTH_USER_KEY, QUERY_DATASOURCE_KEY} from "../keysConst.ts";
import {TDataSourceWOwner} from "../types/dataSources.ts";
import {TUser} from "@dataramen/types";

export const getDataSource = (dsId?: string): TDataSourceWOwner | undefined => {
  if (!dsId) {
    return undefined;
  }

  const user = queryClient.getQueryData<TUser>([QUERY_AUTH_USER_KEY]);
  if (!user) {
    return undefined;
  }

  const dataSources = queryClient.getQueryData<TDataSourceWOwner[]>([QUERY_DATASOURCE_KEY, user.teamId]);
  return dataSources?.find((ds) => ds.id === dsId);
}