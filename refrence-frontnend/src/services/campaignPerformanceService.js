import apiService from "./apiService";
import { authHeaders } from "../utils/helper";

const authConfig = (token = "") => (token ? { headers: authHeaders(token) } : {});

export const campaignPerformanceService = {
  list: async (payload, token = "") =>
    apiService.post("amazon/report/campaign-performance-list", payload, authConfig(token))
};

export default campaignPerformanceService;