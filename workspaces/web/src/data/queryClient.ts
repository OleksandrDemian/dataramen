// Create a client
import {QueryClient} from "react-query";
import {isAxiosError} from "axios";

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
});
