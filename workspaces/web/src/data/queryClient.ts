import {MutationCache, QueryClient} from "@tanstack/react-query";
import {isAxiosError} from "axios";
import toast from "react-hot-toast";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        if (isAxiosError(error) && error.response?.status === 404) {
          return false;
        }

        return failureCount < 3;
      }
    },
  },
  mutationCache: new MutationCache({
    onError: (error: unknown) => {
      if (isAxiosError<{ error: string }>(error)) {
        if (error.status && error.status >= 400 && error.status < 500 && error.response?.data.error) {
          toast.error(error.response.data.error);
        }
      }
    },
  }),
});
