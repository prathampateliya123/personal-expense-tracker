import apiService from "./apiService";

export const INITIAL_SAVING_FILTERS = {
  search: "",
  status: "",
  page: 1,
  limit: 10,
};

export const buildSavingQueryParams = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  return params.toString();
};

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
