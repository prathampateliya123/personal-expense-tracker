import apiService from "./apiService";
import { authHeaders } from "../utils/helper";

const authConfig = (token = "") => (token ? { headers: authHeaders(token) } : {});

export const negativeKeywordService = {
  list: async (payload, token = "") =>
    apiService.post("amazon/report/negative-keyword-list", payload, authConfig(token))
};

export default negativeKeywordService;
