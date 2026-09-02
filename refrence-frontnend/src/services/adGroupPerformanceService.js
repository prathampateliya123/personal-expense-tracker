import apiService from "./apiService";
import { authHeaders } from "../utils/helper";

const authConfig = (token = "") => (token ? { headers: authHeaders(token) } : {});

export const adGroupPerformanceService = {
  list: async (payload, token = "") =>
    apiService.post("amazon/report/ad-group-performance-list", payload, authConfig(token))
};

export default adGroupPerformanceService;