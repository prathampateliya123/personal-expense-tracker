import apiService from "./apiService";
import { authHeaders } from "../utils/helper";

const authConfig = (token = "") => (token ? { headers: authHeaders(token) } : {});

export const userService = {
  getUser: async (token = "") => apiService.get("user/get-user", authConfig(token)),

  changePassword: async (payload, token = "") =>
    apiService.post("user/profile/change-password", payload, authConfig(token)),

  updateProfile: async (payload, token = "") =>
    apiService.post("user/profile/update-profile", payload, authConfig(token)),

  updateStoreDetails: async (payload, token = "") =>
    apiService.post("user/profile/update-store-details", payload, authConfig(token)),

  connectAmazonAds: async (token = "") =>
    apiService.post("amazon/ads/connect", {}, authConfig(token)),

  amazonAdsCallback: async (payload, token = "") =>
    apiService.post("amazon/ads/callback", payload, authConfig(token)),

  selectAmazonAdsProfile: async (payload, token = "") =>
    apiService.post("amazon/ads/select-profile", payload, authConfig(token)),

  listAmazonStores: async (token = "", params = {}) => {
    const search = String(params?.search || "").trim();
    return apiService.get("amazon/store/list", {
      ...authConfig(token),
      params: {
        ...(search ? { search } : {})
      }
    });
  },

  getStore: async (storeId, token = "") =>
    apiService.get(`user/get-store/${storeId}`, authConfig(token)),

  createAmazonStore: async (payload, token = "") =>
    apiService.post("amazon/store/create", payload, authConfig(token))
};

export default userService;