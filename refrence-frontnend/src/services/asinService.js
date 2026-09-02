import apiService from "./apiService";
import { authHeaders } from "../utils/helper";

const authConfig = (token = "") => (token ? { headers: authHeaders(token) } : {});

export const listAsins = async (payload, token = "") =>
  apiService.post("amazon/rule/asin-list", payload, authConfig(token));

export const listAsinGroups = async (payload, token = "") =>
  apiService.post("amazon/rule/asin-group-list", payload, authConfig(token));

export const editAsinGroup = async (payload, token = "") =>
  apiService.post("amazon/rule/asin-group-edit", payload, authConfig(token));

export const bulkEditAsinGroup = async ({ store_id, file }, token = "") => {
  const formData = new FormData();
  formData.append("store_id", String(Number(store_id) || 0));
  formData.append("file", file);
  return apiService.post("amazon/rule/asin-group-bulk-edit", formData, authConfig(token));
};
