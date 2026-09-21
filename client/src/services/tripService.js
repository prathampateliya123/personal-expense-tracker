import apiService from "./apiService";
import { INITIAL_LIST_FILTERS, buildListQueryParams } from "./buildListQuery";

export const INITIAL_TRIP_FILTERS = {
  ...INITIAL_LIST_FILTERS,
  status: "",
};

export const tripService = {
  list: (filters = INITIAL_TRIP_FILTERS) => {
    const query = buildListQueryParams(filters, ["status"]);
    return apiService.get(`/trips?${query}`);
  },
  getStats: () => apiService.get("/trips/stats"),
  getById: (id) => apiService.get(`/trips/${id}`),
  create: (payload) => apiService.post("/trips", payload),
  update: (id, payload) => apiService.put(`/trips/${id}`, payload),
  remove: (id) => apiService.delete(`/trips/${id}`),
  addExpense: (tripId, payload) =>
    apiService.post(`/trips/${tripId}/expenses`, payload),
  updateExpense: (tripId, expenseId, payload) =>
    apiService.put(`/trips/${tripId}/expenses/${expenseId}`, payload),
  removeExpense: (tripId, expenseId) =>
    apiService.delete(`/trips/${tripId}/expenses/${expenseId}`),
  recordSettlement: (tripId, payload) =>
    apiService.post(`/trips/${tripId}/settlements`, payload),
  removeSettlement: (tripId, settlementId) =>
    apiService.delete(`/trips/${tripId}/settlements/${settlementId}`),
};

export default tripService;
