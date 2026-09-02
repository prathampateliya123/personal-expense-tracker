import apiService from "./apiService";
import { authHeaders } from "../utils/helper";

const authConfig = (token = "") => (token ? { headers: authHeaders(token) } : {});

export const negativeTargetService = {
  list: async (payload, token = "") =>
    apiService.post("amazon/report/negative-target-list", payload, authConfig(token))
};

export default negativeTargetService;
