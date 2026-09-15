import apiService from "./apiService";
import { INITIAL_LIST_FILTERS, buildListQueryParams } from "./buildListQuery";

export const INITIAL_INVESTMENT_FILTERS = {
  ...INITIAL_LIST_FILTERS,
  type: "",
};

export const buildInvestmentQueryParams = (filters = {}) =>
  buildListQueryParams(filters, ["type"]);

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
