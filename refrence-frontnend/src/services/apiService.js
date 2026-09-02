import axios from "axios";

import { getApiHeaders } from "../utils/helper";

const resolveApiBaseUrl = () => {
  const backendApi = import.meta.env.VITE_BACKEND_API;
  return typeof backendApi === "string" ? backendApi.replace(/\/+$/, "") : "";
};

const backendTarget = String(import.meta.env.VITE_BACKEND_API || "").toLowerCase();

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const headers = getApiHeaders();
    if (headers.Authorization && !config.headers?.Authorization) {
      config.headers.Authorization = headers.Authorization;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    if (
      backendTarget.includes("ngrok") ||
      backendTarget.includes("devtunnels.ms") ||
      backendTarget.includes("loca.lt") ||
      backendTarget.includes("trycloudflare.com") ||
      config.baseURL?.includes("ngrok") ||
      config.baseURL?.includes("devtunnels.ms")
    ) {
      config.headers["ngrok-skip-browser-warning"] = "true";
      config.headers["Skip-Browser-Warning"] = "true";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      const data = error.response.data;
      const apiMessage = data.message || data.detail || data.errors || data.error;
      if (apiMessage) {
        error.message =
          typeof apiMessage === "string" ? apiMessage : JSON.stringify(apiMessage);
      }
    }

    import("../hooks/useHandleError").then(({ handleApiError }) => {
      handleApiError(error);
    });

    return Promise.reject(error);
  }
);

const apiService = {
  get: async (url, config = {}) => {
    const response = await apiClient.get(url, config);
    return response.data;
  },

  post: async (url, data, config = {}) => {
    if (data instanceof FormData) {
      const cfg = {
        ...config,
        headers: {
          ...config.headers,
          "Content-Type": undefined
        }
      };
      const response = await apiClient.post(url, data, cfg);
      return response.data;
    }
    const response = await apiClient.post(url, data, config);
    return response.data;
  },

  put: async (url, data, config = {}) => {
    if (data instanceof FormData) {
      const cfg = {
        ...config,
        headers: {
          ...config.headers,
          "Content-Type": undefined
        }
      };
      const response = await apiClient.put(url, data, cfg);
      return response.data;
    }
    const response = await apiClient.put(url, data, config);
    return response.data;
  },

  delete: async (url, config = {}) => {
    const response = await apiClient.delete(url, config);
    return response.data;
  },

  patch: async (url, data, config = {}) => {
    const response = await apiClient.patch(url, data, config);
    return response.data;
  }
};

export default apiService;