import apiService from "./apiService";

export const getCurrentPeriod = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
};

export const shiftPeriod = (year, month, delta) => {
  const date = new Date(year, month - 1 + delta, 1);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
};

export const formatPeriodLabel = (year, month) =>
  new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

export const budgetService = {
  list: (year) => {
    const query = year ? `?year=${year}` : "";
    return apiService.get(`/budgets${query}`);
  },

  current: ({ year, month } = getCurrentPeriod()) =>
    apiService.get(`/budgets/current?year=${year}&month=${month}`),

  upsert: (payload) => apiService.put("/budgets", payload),

  copy: (payload) => apiService.post("/budgets/copy", payload),

  remove: (id) => apiService.delete(`/budgets/${id}`),
};

export default budgetService;
