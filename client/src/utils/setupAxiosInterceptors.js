/**
 * utils/setupAxiosInterceptors.js
 * On 401 (invalid/missing JWT cookie), clear auth state so guards redirect to login.
 */

import axiosInstance from "./axiosInstance";
import { resetAuth } from "../redux/authSlice";

/** These endpoints may return 401 without meaning "session expired" */
const PUBLIC_AUTH_URLS = [
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/auth/forgot-password",
];

const isPublicAuthRequest = (url = "") =>
  PUBLIC_AUTH_URLS.some((path) => url.includes(path));

export const setupAxiosInterceptors = (store) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const requestUrl = error.config?.url || "";

      if (status === 401 && !isPublicAuthRequest(requestUrl)) {
        store.dispatch(resetAuth());
      }

      return Promise.reject(error);
    }
  );
};
