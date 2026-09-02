import apiService from "./apiService";
import { authHeaders } from "../utils/helper";

const authConfig = (token = "") => (token ? { headers: authHeaders(token) } : {});

export const campaignListService = {
  list: async (payload, token = "") =>
    apiService.post("amazon/report/campaign-list", payload, authConfig(token))
};

export default campaignListService;