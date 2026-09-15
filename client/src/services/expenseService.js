import apiService from "./apiService";
import {
  INITIAL_TRANSACTION_FILTERS,
  buildTransactionQueryParams,
} from "./buildTransactionQuery";

export const INITIAL_EXPENSE_FILTERS = { ...INITIAL_TRANSACTION_FILTERS };

export const buildExpenseQueryParams = buildTransactionQueryParams;

export const expenseService = {
  list: (filters = INITIAL_EXPENSE_FILTERS) => {
    const query = buildExpenseQueryParams(filters);
    return apiService.get(`/expenses?${query}`);
  },

  getById: (id) => apiService.get(`/expenses/${id}`),

  create: (payload) => apiService.post("/expenses", payload),

  update: (id, payload) => apiService.put(`/expenses/${id}`, payload),

  remove: (id) => apiService.delete(`/expenses/${id}`),

  getStats: () => apiService.get("/expenses/stats"),
};

export default expenseService;
