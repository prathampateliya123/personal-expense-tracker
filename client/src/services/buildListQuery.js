export const buildListQueryParams = (filters = {}, extraKeys = []) => {
  const params = new URLSearchParams();

  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  for (const key of extraKeys) {
    const value = filters[key];
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value).trim ? String(value).trim() : String(value));
  }

  return params.toString();
};

export const INITIAL_LIST_FILTERS = {
  search: "",
  page: 1,
  limit: 10,
};
