import axiosInstance from "./axiosInstance";
import { PUBLIC_AUTH_URLS } from "../utils/constants";
import { getApiErrorMessage } from "../utils/helper";
import { queryClient } from "./queryClient";
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
        queryClient.setQueryData(userKeys.profile(), null);
        queryClient.removeQueries({ queryKey: expenseKeys.all });
        queryClient.removeQueries({ queryKey: ["incomes"] });
        queryClient.removeQueries({ queryKey: ["budgets"] });
        queryClient.removeQueries({ queryKey: ["savings"] });
        queryClient.removeQueries({ queryKey: ["investments"] });
        queryClient.removeQueries({ queryKey: ["subscriptions"] });
        queryClient.removeQueries({ queryKey: ["categories"] });
        queryClient.removeQueries({ queryKey: ["paymentMethods"] });
      }

      return Promise.reject(error);
    }
  );
};
