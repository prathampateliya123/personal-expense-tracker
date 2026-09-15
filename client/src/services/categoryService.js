import apiService from "./apiService";
import { INITIAL_LIST_FILTERS, buildListQueryParams } from "./buildListQuery";

export const INITIAL_CATEGORY_FILTERS = {
  ...INITIAL_LIST_FILTERS,
  type: "expense",
  color: "",
};

export const buildCategoryQueryParams = (filters = {}) =>
  buildListQueryParams(filters, ["type", "color"]);

export const categoryService = {
  list: (filters = INITIAL_CATEGORY_FILTERS) => {
    const query = buildCategoryQueryParams(filters);
    return apiService.get(`/categories?${query}`);
  },

  options: (type) => {
    const query = type ? `?type=${encodeURIComponent(type)}` : "";
    return apiService.get(`/categories/options${query}`);
  },

  create: (payload) => apiService.post("/categories", payload),

  update: (id, payload) => apiService.put(`/categories/${id}`, payload),

  remove: (id) => apiService.delete(`/categories/${id}`),
};

export default categoryService;
