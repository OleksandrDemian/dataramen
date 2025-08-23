import axios, {isAxiosError} from "axios";
import {AccessTokenHandler} from "../services/accessTokenHandler.ts";
import toast from "react-hot-toast";

// todo: VITE_API_BACKEND_URL is mocked to use PORT 4466
const baseURL = (() => {
  // dev env or dataramen hosted app, point to env variable
  if (location.hostname.includes("app.dataramen.xyz") || import.meta.env.DEV) {
    return`${import.meta.env.VITE_API_BACKEND_URL}/api`;
  }

  // self hosted app, point to /api
  return "/api";
})();

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

// add user_id to the request headers
apiClient.interceptors.request.use(async (config) => {
  const accessToken = await AccessTokenHandler.get();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError<{ error: string }>(error)) {
      if (error.status === 401 && error?.response?.data.error !== "Missing auth token") {
        AccessTokenHandler.refresh();
        return;
      }

      if (error.status && error.status >= 400 && error.status < 500 && error.response?.data.error) {
        toast.error(error.response.data.error);
      }
    }

    return error;
  }
);

export const apiClientNoAuth = axios.create({
  baseURL,
  withCredentials: true,
});
