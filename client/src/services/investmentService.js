/**
 * services/investmentService.js
 */

import apiService from "./apiService";

export const INITIAL_INVESTMENT_FILTERS = {
  search: "",
  type: "",
  page: 1,
  limit: 10,
};

export const buildInvestmentQueryParams = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.type) params.set("type", filters.type);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  return params.toString();
};

export const investmentService = {
  list: (filters = INITIAL_INVESTMENT_FILTERS) => {
    const query = buildInvestmentQueryParams(filters);
    return apiService.get(`/investments?${query}`);
  },
  getStats: () => apiService.get("/investments/stats"),
  getTypes: () => apiService.get("/investments/types"),
  getById: (id) => apiService.get(`/investments/${id}`),
  create: (payload) => apiService.post("/investments", payload),
  update: (id, payload) => apiService.put(`/investments/${id}`, payload),
  remove: (id) => apiService.delete(`/investments/${id}`),
};

export default investmentService;
