/**
 * services/paymentMethodService.js
 * Payment method API calls — list supports search + pagination.
 */

import apiService from "./apiService";

export const INITIAL_PAYMENT_METHOD_FILTERS = {
  search: "",
  page: 1,
  limit: 10,
};

export const buildPaymentMethodQueryParams = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  return params.toString();
};

export const paymentMethodService = {
  list: (filters = INITIAL_PAYMENT_METHOD_FILTERS) => {
    const query = buildPaymentMethodQueryParams(filters);
    return apiService.get(`/payment-methods?${query}`);
  },

  options: () => apiService.get("/payment-methods/options"),

  create: (payload) => apiService.post("/payment-methods", payload),

  update: (id, payload) => apiService.put(`/payment-methods/${id}`, payload),

  remove: (id) => apiService.delete(`/payment-methods/${id}`),
};

export default paymentMethodService;
