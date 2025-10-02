import {TQueryOptions} from "./queries";

export type TGetQueryHistoryResponse = {
  id: string;
  name: string;
  dataSourceId: string;
  opts: Partial<TQueryOptions>;
};