import apiService from "./apiService";

export const INITIAL_CATEGORY_FILTERS = {
  type: "expense",
  search: "",
  color: "",
  page: 1,
  limit: 10,
};

export const buildCategoryQueryParams = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.type) params.set("type", filters.type);
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.color) params.set("color", filters.color);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  return params.toString();
};

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
