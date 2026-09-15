import apiService from "./apiService";

export const INITIAL_INCOME_FILTERS = {
  category: "",
  paymentMode: "",
  startDate: "",
  endDate: "",
  dateOperator: "",
  datePreset: "",
  search: "",
  page: 1,
  limit: 10,
  sortBy: "date",
};

export const buildIncomeQueryParams = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.category) params.set("category", filters.category);
  if (filters.paymentMode) params.set("paymentMode", filters.paymentMode);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.dateOperator) params.set("dateOperator", filters.dateOperator);
  if (filters.datePreset) params.set("datePreset", filters.datePreset);
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);

  return params.toString();
};

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
