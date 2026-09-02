import apiService from "./apiService";
import { authHeaders } from "../utils/helper";

const authConfig = (token = "") => (token ? { headers: authHeaders(token) } : {});

export const budgetPacingService = {
  list: async (payload, token = "") =>
    apiService.post("amazon/report/budget-pacing-list", payload, authConfig(token))
};

export default budgetPacingService;