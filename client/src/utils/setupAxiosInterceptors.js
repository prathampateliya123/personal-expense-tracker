/**
 * utils/setupAxiosInterceptors.js
 * Global axios interceptors — 401 session reset and normalized error messages.
 */

import axiosInstance from "./axiosInstance";
import { PUBLIC_AUTH_URLS } from "./constants";
import { getApiErrorMessage } from "./helpers";
import { resetAuth } from "../redux/slices/authSlice";

const isPublicAuthRequest = (url = "") =>
  PUBLIC_AUTH_URLS.some((path) => url.includes(path));

export const setupAxiosInterceptors = (store) => {
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
        store.dispatch(resetAuth());
      }

      return Promise.reject(error);
    }
  );
};
