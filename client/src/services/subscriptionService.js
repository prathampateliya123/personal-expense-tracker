import apiService from "./apiService";
import { INITIAL_LIST_FILTERS, buildListQueryParams } from "./buildListQuery";

export const INITIAL_SUBSCRIPTION_FILTERS = {
  ...INITIAL_LIST_FILTERS,
  status: "",
  billingCycle: "",
};

export const buildSubscriptionQueryParams = (filters = {}) =>
  buildListQueryParams(filters, ["status", "billingCycle"]);

export const subscriptionService = {
  list: (filters = INITIAL_SUBSCRIPTION_FILTERS) => {
    const query = buildSubscriptionQueryParams(filters);
    return apiService.get(`/subscriptions?${query}`);
  },
  getStats: () => apiService.get("/subscriptions/stats"),
  getById: (id) => apiService.get(`/subscriptions/${id}`),
  create: (payload) => apiService.post("/subscriptions", payload),
  update: (id, payload) => apiService.put(`/subscriptions/${id}`, payload),
  remove: (id) => apiService.delete(`/subscriptions/${id}`),
  pause: (id) => apiService.post(`/subscriptions/${id}/pause`),
  resume: (id) => apiService.post(`/subscriptions/${id}/resume`),
  cancel: (id) => apiService.post(`/subscriptions/${id}/cancel`),
};

export default subscriptionService;
