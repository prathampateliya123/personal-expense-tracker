import apiService from "./apiService";
import { authHeaders } from "../utils/helper";

const authConfig = (token = "") => (token ? { headers: authHeaders(token) } : {});

export const placementReportService = {
  list: async (payload, token = "") =>
    apiService.post("amazon/report/placement-performance-list", payload, authConfig(token))
};

export default placementReportService;