import apiService from "./apiService";
import { authHeaders } from "../utils/helper";

const authConfig = (token = "") => (token ? { headers: authHeaders(token) } : {});

export const advertisedProductService = {
  list: async (payload, token = "") =>
    apiService.post("amazon/report/product-performance-list", payload, authConfig(token))
};

export default advertisedProductService;