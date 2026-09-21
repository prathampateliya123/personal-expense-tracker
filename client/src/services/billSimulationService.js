import apiService from "./apiService";
import { INITIAL_LIST_FILTERS, buildListQueryParams } from "./buildListQuery";

export const INITIAL_BILL_SIM_FILTERS = {
  ...INITIAL_LIST_FILTERS,
  billType: "",
};

export const billSimulationService = {
  calculate: (payload) => apiService.post("/bill-simulations/calculate", payload),
  list: (filters = INITIAL_BILL_SIM_FILTERS) => {
    const query = buildListQueryParams(filters, ["billType"]);
    return apiService.get(`/bill-simulations?${query}`);
  },
  getStats: () => apiService.get("/bill-simulations/stats"),
  getById: (id) => apiService.get(`/bill-simulations/${id}`),
  create: (payload) => apiService.post("/bill-simulations", payload),
  update: (id, payload) => apiService.put(`/bill-simulations/${id}`, payload),
  remove: (id) => apiService.delete(`/bill-simulations/${id}`),
};

export default billSimulationService;
