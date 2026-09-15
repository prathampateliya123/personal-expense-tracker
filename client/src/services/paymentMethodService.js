import apiService from "./apiService";
import { INITIAL_LIST_FILTERS, buildListQueryParams } from "./buildListQuery";

export const INITIAL_PAYMENT_METHOD_FILTERS = { ...INITIAL_LIST_FILTERS };

export const buildPaymentMethodQueryParams = (filters = {}) =>
  buildListQueryParams(filters);

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
