import {apiClient} from "../clients.ts";
import {TQuery} from "@dataramen/types";
import {queryClient} from "../queryClient.ts";

export const fetchQueryById = async (id: string) => {
  return queryClient.fetchQuery({
    queryKey: ["query", id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TQuery }>("/queries/" + id);
      return data.data;
    },
  });
};
