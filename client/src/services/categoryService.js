/**
 * services/categoryService.js
 * Category management API calls.
 */

import apiService from "./apiService";

export const categoryService = {
  list: () => apiService.get("/categories"),

  create: (payload) => apiService.post("/categories", payload),

  update: (id, payload) => apiService.put(`/categories/${id}`, payload),

  remove: (id) => apiService.delete(`/categories/${id}`),
};

export default categoryService;
