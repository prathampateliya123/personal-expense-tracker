/**
 * utils/setupAxiosInterceptors.js
 * Global axios interceptors — 401 session reset and normalized error messages.
 *
 * Important: never removeQueries on the active user profile key. That tears down
 * an observed query and React Query immediately refetches → 401 loop.
 */

import axiosInstance from "./axiosInstance";
import { PUBLIC_AUTH_URLS } from "./constants";
import { getApiErrorMessage } from "./helper";
import { queryClient } from "../lib/queryClient";
import { expenseKeys, userKeys } from "../services/queryKeys";

const isPublicAuthRequest = (url = "") =>
  PUBLIC_AUTH_URLS.some((path) => url.includes(path));

export const setupAxiosInterceptors = () => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const requestUrl = error.config?.url || "";

      const message = getApiErrorMessage(error);
      if (message) {
        error.message = message;
      }

      if (status === 401 && !isPublicAuthRequest(requestUrl)) {
        // Mark logged-out without destroying the observed profile query
        queryClient.setQueryData(userKeys.profile(), null);
        // Drop protected resource caches only
        queryClient.removeQueries({ queryKey: expenseKeys.all });
      }

      return Promise.reject(error);
    }
  );
};
