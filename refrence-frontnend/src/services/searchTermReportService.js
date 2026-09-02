import apiService from "./apiService";
import { authHeaders } from "../utils/helper";

const authConfig = (token = "") => (token ? { headers: authHeaders(token) } : {});

export const searchTermReportService = {
  list: async (payload, token = "") =>
    apiService.post("amazon/report/search-term-list", payload, authConfig(token))
};

export default searchTermReportService;