import axiosInstance from "../lib/axiosInstance";

const apiService = {
  get: async (url, config = {}) => {
    const response = await axiosInstance.get(url, config);
    return response.data;
  },

  post: async (url, data, config = {}) => {
    const response = await axiosInstance.post(url, data, config);
    return response.data;
  },

  put: async (url, data, config = {}) => {
    const response = await axiosInstance.put(url, data, config);
    return response.data;
  },

  delete: async (url, config = {}) => {
    const response = await axiosInstance.delete(url, config);
    return response.data;
  },

  patch: async (url, data, config = {}) => {
    const response = await axiosInstance.patch(url, data, config);
    return response.data;
  },
};

export default apiService;
