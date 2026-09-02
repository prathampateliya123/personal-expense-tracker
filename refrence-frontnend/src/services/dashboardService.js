import apiService from "./apiService";
import { authHeaders } from "../utils/helper";
import { getCookie, STORE_ID_NAME } from "../utils/cookie";
import {
  buildDashboardPayload,
  buildDashboardTabListPayload,
  normalizeChartSeries,
  normalizeDashboardBundle,
  normalizeDashboardList,
  normalizeKpiSummary
} from "../utils/dashboard";

const authConfig = (token = "") => (token ? { headers: authHeaders(token) } : {});

const postDashboard = async (path, payload, token = "") =>
  apiService.post(path, buildDashboardPayload(payload), authConfig(token));

const rangeOf = (payload = {}) => String(payload.range || "wow").toLowerCase();

export const dashboardService = {
  summary: async (payload, token = "") => {
    const res = await postDashboard("user/dashboard/summary", payload, token);
    return normalizeKpiSummary(res, rangeOf(payload));
  },

  chartAdSurplus: async (payload, token = "") => {
    const res = await postDashboard("user/dashboard/chart-ad-surplus", payload, token);
    return normalizeChartSeries(res, rangeOf(payload));
  },

  chartSpendSales: async (payload, token = "") => {
    const res = await postDashboard("user/dashboard/chart-spend-sales", payload, token);
    return normalizeChartSeries(res, rangeOf(payload));
  },

  chartAcos: async (payload, token = "") => {
    const res = await postDashboard("user/dashboard/chart-acos", payload, token);
    return normalizeChartSeries(res, rangeOf(payload));
  },

  chartWastedSpend: async (payload, token = "") => {
    const res = await postDashboard("user/dashboard/chart-wasted-spend", payload, token);
    return normalizeChartSeries(res, rangeOf(payload));
  },

  chartCpc: async (payload, token = "") => {
    const res = await postDashboard("user/dashboard/chart-cpc", payload, token);
    return normalizeChartSeries(res, rangeOf(payload));
  },

  chartCvr: async (payload, token = "") => {
    const res = await postDashboard("user/dashboard/chart-cvr", payload, token);
    return normalizeChartSeries(res, rangeOf(payload));
  },

  list: async (payload, token = "") => {
    const res = await postDashboard("user/dashboard/dashboard-list", payload, token);
    return normalizeDashboardList(res, payload);
  },

  searchTerms: async (payload, token = "") => {
    const body = buildDashboardTabListPayload(payload);
    const res = await apiService.post(
      "user/dashboard/search-terms-list",
      body,
      authConfig(token)
    );
    return normalizeDashboardList(res, { ...payload, range: body.p_type, page: body.page, limit: body.limit });
  },



  placements: async (payload, token = "") => {
    const body = buildDashboardTabListPayload(payload);
    const res = await apiService.post(
      "user/dashboard/placements-list",
      body,
      authConfig(token)
    );
    return normalizeDashboardList(res, { ...payload, range: body.p_type, page: body.page, limit: body.limit });
  },

  placementsChart: async (payload, token = "") => {
    const body = {
      store_id: Number(payload.storeId || payload.store_id || getCookie(STORE_ID_NAME)) || 0,
      range: String(payload.range || payload.p_type || "wow").toLowerCase(),
      limit: null,
      overlay_profit: Boolean(payload.overlayProfit ?? payload.overlay_profit ?? true),
      margin_pct: Number(payload.marginPct || payload.margin_pct) || 10
    };
    if (payload.date_from || payload.start_date) body.start_date = payload.date_from || payload.start_date;
    if (payload.date_to || payload.end_date) body.end_date = payload.date_to || payload.end_date;

    const res = await apiService.post(
      "user/dashboard/placements",
      body,
      authConfig(token)
    );
    return res?.data ?? res;
  },

  matchTypes: async (payload, token = "") => {
    const body = buildDashboardTabListPayload(payload);
    const res = await apiService.post(
      "user/dashboard/match-types-list",
      body,
      authConfig(token)
    );
    return normalizeDashboardList(res, { ...payload, range: body.p_type, page: body.page, limit: body.limit });
  },

  matchTypesChart: async (payload, token = "") => {
    const body = {
      store_id: Number(payload.storeId || payload.store_id || getCookie(STORE_ID_NAME)) || 0,
      range: String(payload.range || payload.p_type || "wow").toLowerCase(),
      limit: null,
      overlay_profit: Boolean(payload.overlayProfit ?? payload.overlay_profit ?? true),
      margin_pct: Number(payload.marginPct || payload.margin_pct) || 10
    };
    if (payload.date_from || payload.start_date) body.start_date = payload.date_from || payload.start_date;
    if (payload.date_to || payload.end_date) body.end_date = payload.date_to || payload.end_date;

    const res = await apiService.post(
      "user/dashboard/match-types",
      body,
      authConfig(token)
    );
    return res?.data ?? res;
  },

  all: async (payload, token = "") => {
    const res = await postDashboard("user/dashboard/all", payload, token);
    return normalizeDashboardBundle(res, rangeOf(payload));
  },

  query: async (payload, token = "") => {
    const res = await postDashboard("user/dashboard/query", payload, token);
    const mode = String(payload?.mode || "").toLowerCase();
    if (mode.includes("summary") || mode === "kpi") {
      return normalizeKpiSummary(res, rangeOf(payload));
    }
    if (mode.includes("list") || mode.includes("campaign")) {
      return normalizeDashboardList(res, payload);
    }
    if (mode.includes("chart") || mode.includes("series")) {
      return normalizeChartSeries(res, rangeOf(payload));
    }
    return normalizeDashboardBundle(res, rangeOf(payload));
  }
};

export default dashboardService;
