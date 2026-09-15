import apiService from "./apiService";
import {
  INITIAL_TRANSACTION_FILTERS,
  buildTransactionQueryParams,
} from "./buildTransactionQuery";

export const INITIAL_INCOME_FILTERS = { ...INITIAL_TRANSACTION_FILTERS };

export const buildIncomeQueryParams = buildTransactionQueryParams;

export const incomeService = {
  list: (filters = INITIAL_INCOME_FILTERS) => {
    const query = buildIncomeQueryParams(filters);
    return apiService.get(`/incomes?${query}`);
  },

  getById: (id) => apiService.get(`/incomes/${id}`),

  create: (payload) => apiService.post("/incomes", payload),

  update: (id, payload) => apiService.put(`/incomes/${id}`, payload),

  remove: (id) => apiService.delete(`/incomes/${id}`),

  getStats: () => apiService.get("/incomes/stats"),
};

export default incomeService;
