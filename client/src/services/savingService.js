import apiService from "./apiService";
import { INITIAL_LIST_FILTERS, buildListQueryParams } from "./buildListQuery";

export const INITIAL_SAVING_FILTERS = {
  ...INITIAL_LIST_FILTERS,
  status: "",
};

export const buildSavingQueryParams = (filters = {}) =>
  buildListQueryParams(filters, ["status"]);

export const savingService = {
  list: (filters = INITIAL_SAVING_FILTERS) => {
    const query = buildSavingQueryParams(filters);
    return apiService.get(`/savings?${query}`);
  },
  getStats: () => apiService.get("/savings/stats"),
  getById: (id) => apiService.get(`/savings/${id}`),
  create: (payload) => apiService.post("/savings", payload),
  update: (id, payload) => apiService.put(`/savings/${id}`, payload),
  remove: (id) => apiService.delete(`/savings/${id}`),
  contribute: (id, amount) =>
    apiService.post(`/savings/${id}/contribute`, { amount }),
  withdraw: (id, amount) =>
    apiService.post(`/savings/${id}/withdraw`, { amount }),
};

export default savingService;
