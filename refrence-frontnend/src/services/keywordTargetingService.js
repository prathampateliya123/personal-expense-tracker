import apiService from "./apiService";
import { authHeaders } from "../utils/helper";

const authConfig = (token = "") => (token ? { headers: authHeaders(token) } : {});

export const keywordTargetingService = {
  list: async (payload, token = "") =>
    apiService.post(
      "amazon/report/keyword-targeting-performance-list",
      payload,
      authConfig(token)
    )
};

export default keywordTargetingService;