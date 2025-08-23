import {useMemo} from "react";
import {AxiosError} from "axios";

export const useParseError = (error: unknown): string | undefined => {
  return useMemo(() => {
    if (!error) return undefined;

    if (error instanceof AxiosError) {
      if (error.response?.data.error) {
        return error.response.data.error;
      } else if (error.response?.data?.message) {
        return error.response.data.message;
      }
      return error.message;
    } else if (error instanceof Error) {
      return error.message;
    }
    return "Undefined error";
  }, [error]);
}