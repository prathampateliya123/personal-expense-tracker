export const queryKeys = {
  user: ["user"],
  campaigns: ["campaigns"],
  dashboard: ["dashboard"],
  auth: ["auth"],
  stores: ["stores"],
  reports: ["reports"],
  rules: ["rules"],
  asin: ["asin"]
};

export const ruleKeys = {
  all: queryKeys.rules,
  lists: () => [...ruleKeys.all, "list"],
  list: (params = {}) => [...ruleKeys.lists(), params],
  details: (id) => [...ruleKeys.all, "detail", String(id || "")],
  config: () => [...ruleKeys.all, "reports-config"],
  campaignList: (ruleId, params = {}) => [
    ...ruleKeys.all,
    "campaign-list",
    String(ruleId || ""),
    params
  ],
  productList: (params = {}) => [...ruleKeys.all, "product-list", params],
  updateProductList: (ruleId, params = {}) => [
    ...ruleKeys.all,
    "update-product-list",
    String(ruleId || ""),
    params
  ]
};

export const campaignKeys = {
  all: queryKeys.campaigns,
  lists: () => [...campaignKeys.all, "list"],
  list: (filters) => [...campaignKeys.lists(), { filters }],
  details: () => [...campaignKeys.all, "detail"],
  detail: (id) => [...campaignKeys.details(), id]
};

export const userKeys = {
  all: queryKeys.user,
  profile: () => [...userKeys.all, "profile"],
  getUser: () => [...userKeys.all, "get-user"],
  changePassword: () => [...userKeys.all, "change-password"],
  updateProfile: () => [...userKeys.all, "update-profile"],
  updateStoreDetails: () => [...userKeys.all, "update-store-details"]
};

export const storeKeys = {
  all: queryKeys.stores,
  list: () => [...storeKeys.all, "list"],
  listFiltered: (params = {}) => [...storeKeys.list(), "filtered", params],
  detail: (storeId) => [...storeKeys.all, "detail", String(storeId || "")],
  create: () => [...storeKeys.all, "create"]
};

export const reportKeys = {
  all: queryKeys.reports,
  lists: () => [...reportKeys.all, "list"],
  advertisedProduct: () => [...reportKeys.all, "advertised-product"],
  adGroupPerformance: () => [...reportKeys.all, "ad-group-performance"],
  budgetPacing: () => [...reportKeys.all, "budget-pacing"],
  campaignList: () => [...reportKeys.all, "campaign-list"],
  ruleBuilderCampaigns: () => [...reportKeys.all, "rule-builder-campaigns"],
  campaignPerformance: () => [...reportKeys.all, "campaign-performance"],
  keywordTargeting: () => [...reportKeys.all, "keyword-targeting"],
  negativeKeywordList: () => [...reportKeys.all, "negative-keyword-list"],
  negativeTargetList: () => [...reportKeys.all, "negative-target-list"],
  placementReport: () => [...reportKeys.all, "placement-report"],
  searchTermReport: () => [...reportKeys.all, "search-term-report"]
};

export const authKeys = {
  all: queryKeys.auth,
  login: () => [...authKeys.all, "login"],
  register: () => [...authKeys.all, "register"],
  callback: () => [...authKeys.all, "callback"],
  logout: () => [...authKeys.all, "logout"],
  forgotPassword: () => [...authKeys.all, "forgot-password"]
};

export const dashboardKeys = {
  all: queryKeys.dashboard,
  summary: (params = {}) => [...dashboardKeys.all, "summary", params],
  chart: (name, params = {}) => [...dashboardKeys.all, "chart", name, params],
  list: (params = {}) => [...dashboardKeys.all, "list", params],
  searchTerms: (params = {}) => [...dashboardKeys.all, "search-terms", params],
  placements: (params = {}) => [...dashboardKeys.all, "placements", params],
  matchTypes: (params = {}) => [...dashboardKeys.all, "match-types", params],
  bundle: (params = {}) => [...dashboardKeys.all, "all", params],
  query: (params = {}) => [...dashboardKeys.all, "query", params]
};

export const asinKeys = {
  all: queryKeys.asin,
  lists: () => [...asinKeys.all, "list"],
  list: (params = {}) => [...asinKeys.lists(), params],
  grouping: () => [...asinKeys.all, "grouping"]
};