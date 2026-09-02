import { getCookie, STORE_ID_NAME } from "./cookie";

export const DASHBOARD_PERIODS = [
  { id: "daily", label: "Daily", apiRange: "daily", unit: "day", compare: "vs prior day" },
  { id: "wow", label: "WoW", apiRange: "wow", unit: "week", compare: "vs prior week" },
  { id: "mom", label: "MoM", apiRange: "mom", unit: "month", compare: "vs prior month" },
  { id: "qoq", label: "QoQ", apiRange: "qoq", unit: "quarter", compare: "vs prior quarter" }
];

export const DASHBOARD_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "search-terms", label: "Search Terms" },
  { id: "placements", label: "Placements" },
  { id: "match-types", label: "Match Types" }
];

const DASHBOARD_SECTION_IDS = new Set(DASHBOARD_SECTIONS.map((section) => section.id));
const DASHBOARD_PERIOD_IDS = new Set(DASHBOARD_PERIODS.map((period) => period.id));

export function getDashboardNavigationType() {
  if (typeof performance === "undefined") return "navigate";
  const [entry] = performance.getEntriesByType("navigation");
  return entry?.type || "navigate";
}

/** Read active dashboard tab + period from URL search params. */
export function readDashboardNavFromSearchParams(searchParams) {
  const section = searchParams?.get?.("section") ?? null;
  const period = searchParams?.get?.("period") ?? null;

  return {
    activeSection: DASHBOARD_SECTION_IDS.has(section) ? section : "overview",
    activePeriod: DASHBOARD_PERIOD_IDS.has(period) ? period : "daily"
  };
}

export function buildDashboardNavSearchParams(searchParams, { section, period } = {}) {
  const next = new URLSearchParams(searchParams?.toString?.() || "");

  if (!section || section === "overview") next.delete("section");
  else next.set("section", section);

  if (!period || period === "daily") next.delete("period");
  else next.set("period", period);

  return next;
}

export function isDashboardSectionId(value) {
  return DASHBOARD_SECTION_IDS.has(value);
}

export function isDashboardPeriodId(value) {
  return DASHBOARD_PERIOD_IDS.has(value);
}

export const CHART_COLORS = {
  spend: "var(--brand-orange)",
  spendHex: "#f68f3d",
  sales: "#3b82f6",
  pos: "#16a34a",
  neg: "#dc2626",
  acos: "#ca8a04",
  waste: "#ef4444",
  placement: ["#f68f3d", "#3b82f6", "#ef4444", "#16a34a", "#ca8a04"]
};

export function getPeriodMeta(periodId = "wow") {
  return DASHBOARD_PERIODS.find((p) => p.id === periodId) || DASHBOARD_PERIODS[1];
}

export function buildDashboardPayload(input = {}) {
  let storeId = Number(input.store_id || input.storeId);
  if (!Number.isFinite(storeId) || storeId === 0) {
    storeId = Number(getCookie(STORE_ID_NAME)) || 0;
  }
  const margin = Number(input.margin_pct);
  const limit = Number(input.limit);

  const payload = {
    store_id: Number.isFinite(storeId) ? storeId : 0,
    range: String(input.range || "wow").toLowerCase(),
    limit: Number.isFinite(limit) && limit > 0 ? limit : 50,
    overlay_profit: Boolean(input.overlay_profit),
    margin_pct: Number.isFinite(margin) ? margin : 10
  };

  if (input.page != null) {
    const page = Number(input.page);
    if (Number.isFinite(page) && page > 0) payload.page = page;
  }

  if (input.search != null && String(input.search).trim()) {
    payload.search = String(input.search).trim();
  }

  if (input.mode != null && String(input.mode).trim()) {
    payload.mode = String(input.mode).trim();
  }

  if (input.sortby) payload.sortby = input.sortby;
  if (input.sortorder) payload.sortorder = input.sortorder;

  if (Array.isArray(input.filters)) {
    payload.filters = input.filters;
  }

  const startDate = input.start_date || input.startDate || input.from || null;
  const endDate = input.end_date || input.endDate || input.to || null;
  if (startDate) payload.start_date = String(startDate).slice(0, 10);
  if (endDate) payload.end_date = String(endDate).slice(0, 10);

  return payload;
}

/** Shared payload for dashboard tab list APIs (search-terms-list, placements-list, …). */
export function buildDashboardTabListPayload(input = {}) {
  let storeId = Number(input.store_id || input.storeId);
  if (!Number.isFinite(storeId) || storeId === 0) {
    storeId = Number(getCookie(STORE_ID_NAME)) || 0;
  }
  const margin = Number(input.margin_pct);
  const page = Number(input.page);
  const limit = Number(input.limit);
  const ruleId = Number(input.rule_id);
  const masterId = Number(input.master_id);

  const payload = {
    store_id: Number.isFinite(storeId) && storeId > 0 ? storeId : 0,
    p_type: String(input.p_type || input.range || input.period || "wow").toLowerCase(),
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
    margin_pct: Number.isFinite(margin) ? margin : 10,
    sortorder: String(input.sortorder || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC"
  };

  if (input.sortby) payload.sortby = String(input.sortby);

  if (input.search != null && String(input.search).trim()) {
    payload.search = String(input.search).trim();
  }

  if (Array.isArray(input.filters) && input.filters.length) {
    payload.filters = input.filters;
  }

  const dateFrom =
    input.date_from || input.start_date || input.startDate || input.from || null;
  const dateTo = input.date_to || input.end_date || input.endDate || input.to || null;
  if (dateFrom) payload.date_from = String(dateFrom).slice(0, 10);
  if (dateTo) payload.date_to = String(dateTo).slice(0, 10);

  if (Number.isFinite(ruleId) && ruleId > 0) payload.rule_id = ruleId;
  if (Number.isFinite(masterId) && masterId > 0) payload.master_id = masterId;

  return payload;
}

/** @deprecated alias — use buildDashboardTabListPayload */
export function buildSearchTermsListPayload(input = {}) {
  return buildDashboardTabListPayload(input);
}

export function buildPlacementsListPayload(input = {}) {
  return buildDashboardTabListPayload(input);
}

export function buildMatchTypesListPayload(input = {}) {
  return buildDashboardTabListPayload(input);
}

const RANGE_ALIASES = {
  daily: ["daily", "day", "dod", "d"],
  wow: ["wow", "weekly", "week", "wo_w", "w"],
  mom: ["mom", "monthly", "month", "mo_m", "m"],
  qoq: ["qoq", "quarterly", "quarter", "qo_q", "q"]
};

export function pickRangeSlice(source, range = "wow") {
  if (source == null) return null;
  if (Array.isArray(source)) return source;
  if (typeof source !== "object") return null;

  const aliases = RANGE_ALIASES[String(range).toLowerCase()] || [range];
  for (const key of aliases) {
    if (source[key] != null) return source[key];
  }

  // single nested period object without matching key
  const keys = Object.keys(source);
  if (keys.length === 1) return source[keys[0]];
  return null;
}

function hasKpiFields(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  return (
    obj.spend != null ||
    obj.ad_spend != null ||
    obj.sales != null ||
    obj.ad_sales != null ||
    obj.ad_surplus != null ||
    obj.surplus != null ||
    obj.acos != null ||
    obj.roas != null ||
    obj.wasted_spend != null
  );
}

/** API metric cell: { current, previous, change, change_pct, lower_is_better } */
function isMetricCell(value) {
  return (
    value != null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (value.current != null || value.previous != null || value.change_pct != null)
  );
}

function toFiniteNumber(value) {
  if (value == null || value === "") return null;
  if (typeof value === "object") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function metricChangeKey(metricKey) {
  if (metricKey === "ad_surplus" || metricKey === "surplus") return "surplus_chg";
  if (metricKey === "wasted_spend" || metricKey === "waste") return "wasted_chg";
  if (metricKey === "est_profit") return "est_profit_chg";
  return `${metricKey}_chg`;
}

/**
 * Flatten summary.kpis shape:
 * { spend: { current, previous, change_pct }, sales: {...}, ... }
 * into flat current + previous objects with *_chg percent fields.
 */
export function flattenNestedKpis(kpis) {
  if (!kpis || typeof kpis !== "object" || Array.isArray(kpis)) {
    return { cur: null, prev: null };
  }

  const entries = Object.entries(kpis);
  const hasNested = entries.some(([, value]) => isMetricCell(value));
  if (!hasNested) {
    return { cur: null, prev: null };
  }

  const cur = {};
  const prev = {};

  for (const [key, value] of entries) {
    if (isMetricCell(value)) {
      cur[key] = value.current ?? null;
      prev[key] = value.previous ?? null;
      const chgKey = metricChangeKey(key);
      if (value.change_pct != null) cur[chgKey] = value.change_pct;
      else if (value.change != null && value.previous != null && Number(value.previous) !== 0) {
        cur[chgKey] = (Number(value.change) / Number(value.previous)) * 100;
      }
      if (value.change != null) cur[`${key}_change`] = value.change;
      if (value.lower_is_better != null) cur[`${key}_lower_is_better`] = value.lower_is_better;
    } else if (value != null && typeof value !== "object") {
      cur[key] = value;
    }
  }

  return {
    cur: hasKpiFields(cur) ? cur : null,
    prev: hasKpiFields(prev) ? prev : null
  };
}

export function normalizeKpiFields(raw = {}) {
  if (!raw || typeof raw !== "object") return {};

  // If this object itself is nested metric map, flatten first
  const nested = flattenNestedKpis(raw);
  const source = nested.cur || raw;

  const read = (...keys) => {
    for (const key of keys) {
      const value = source[key];
      if (value == null || value === "") continue;
      if (isMetricCell(value)) {
        const n = toFiniteNumber(value.current);
        if (n != null) return n;
        continue;
      }
      if (typeof value === "object" && value.value != null) {
        const n = toFiniteNumber(value.value);
        if (n != null) return n;
        continue;
      }
      const n = toFiniteNumber(value);
      if (n != null) return n;
    }
    return null;
  };

  const readChg = (flatKeys, metricKey) => {
    for (const key of flatKeys) {
      const n = toFiniteNumber(source[key]);
      if (n != null) return n;
    }
    const cell = raw[metricKey] || source[metricKey];
    if (isMetricCell(cell)) {
      const pct = toFiniteNumber(cell.change_pct);
      if (pct != null) return pct;
    }
    return null;
  };

  const spend = read("spend", "ad_spend", "adSpend", "cost");
  const sales = read("sales", "ad_sales", "adSales", "revenue");
  const adSurplus = read("ad_surplus", "surplus", "adSurplus");
  const acos = read("acos", "acos_pct", "aCoS");
  const roas = read("roas", "ROAS");
  const wasted = read("wasted_spend", "wastedSpend", "waste");
  const estProfitVal = read("est_profit", "estProfit", "profit");

  return {
    ...source,
    spend,
    sales,
    ad_surplus:
      adSurplus != null ? adSurplus : spend != null && sales != null ? sales - spend : null,
    acos,
    roas,
    wasted_spend: wasted,
    est_profit: estProfitVal,
    spend_chg: readChg(["spend_chg", "spend_change", "spend_chg_pct"], "spend"),
    sales_chg: readChg(
      ["sales_chg", "sales_change", "sales_chg_pct", "sales_delta_pct"],
      "sales"
    ),
    surplus_chg: readChg(
      ["surplus_chg", "surplus_change", "ad_surplus_chg", "ad_surplus_chg_pct"],
      "ad_surplus"
    ),
    acos_chg: readChg(["acos_chg", "acos_change", "acos_chg_pct"], "acos"),
    roas_chg: readChg(["roas_chg", "roas_change", "roas_chg_pct"], "roas"),
    wasted_chg: readChg(["wasted_chg", "wasted_change", "wasted_chg_pct"], "wasted_spend"),
    est_profit_chg: readChg(
      ["est_profit_chg", "est_profit_change", "est_profit_chg_pct"],
      "est_profit"
    ),
    cpc: read("cpc"),
    cvr: read("cvr", "cvr_pct"),
    ctr: read("ctr"),
    orders: read("orders"),
    clicks: read("clicks"),
    impressions: read("impressions"),
    units_sold: read("units_sold"),
    period: source.period || source.report_date || source.date || source.label || null
  };
}

export function unwrapDashboardData(payload) {
  if (payload == null) return {};
  if (Array.isArray(payload)) return payload;

  let root = payload?.data !== undefined ? payload.data : payload;

  // peel { status, message, data } — but keep list envelopes that carry rows + pagination
  for (let i = 0; i < 3; i += 1) {
    if (
      root &&
      typeof root === "object" &&
      !Array.isArray(root) &&
      root.data !== undefined &&
      (root.status != null || root.message != null || root.success != null)
    ) {
      const isListEnvelope =
        Array.isArray(root.data) &&
        (root.totalRecords != null ||
          root.total_records != null ||
          root.totalPages != null ||
          root.total_pages != null ||
          root.mode != null ||
          root.meta != null);
      if (isListEnvelope) break;
      root = root.data;
      continue;
    }
    break;
  }

  return root ?? {};
}

function isDashboardListEnvelope(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Array.isArray(value.data) &&
    (value.totalRecords != null ||
      value.total_records != null ||
      value.totalPages != null ||
      value.total_pages != null ||
      value.mode != null ||
      value.meta != null)
  );
}

function normalizeHealthStatus(value) {
  const raw = String(value || "").trim().toUpperCase();
  if (!raw) return null;
  if (raw.includes("HIGH")) return "high";
  if (raw.includes("MEDIUM")) return "medium";
  if (raw.includes("HEALTH")) return "healthy";
  return null;
}

function normalizeDashboardListRow(row) {
  if (!row || typeof row !== "object") return row;
  const metrics = normalizeKpiFields(row);
  return {
    ...row,
    ...metrics,
    campaign: row.campaign || row.campaign_name || row.name || row.campaignName || "",
    search_term:
      row.search_term ||
      row.searchterm ||
      row.customer_search_term ||
      row.term ||
      row.keyword ||
      row.query ||
      "",
    placement:
      row.placement ||
      row.placement_name ||
      row.placement_type ||
      row.placementType ||
      row.name ||
      "",
    match_type:
      row.match_type ||
      row.matchtype ||
      row.matchType ||
      row.match_type_name ||
      row.targeting_type ||
      "",
    spend_chg_pct: metrics.spend_chg ?? row.spend_chg_pct ?? row.spend_delta_pct ?? null,
    sales_chg_pct: metrics.sales_chg ?? row.sales_chg_pct ?? row.sales_delta_pct ?? null,
    acos_chg_pct: metrics.acos_chg ?? row.acos_chg_pct ?? row.acos_delta ?? null,
    surplus_chg: row.surplus_chg ?? row.surplus_delta ?? metrics.surplus_chg ?? null,
    wasted_chg_pct: row.wasted_chg_pct ?? row.wasted_delta ?? null,
    est_profit_chg: row.est_profit_chg ?? row.est_profit_delta ?? null,
    est_profit_delta: row.est_profit_delta ?? row.est_profit_chg ?? metrics.est_profit_chg ?? null,
    orders: metrics.orders ?? row.orders ?? null,
    clicks: metrics.clicks ?? row.clicks ?? null,
    sales: metrics.sales ?? row.sales ?? row.ad_sales ?? null,
    spend_share_pct: row.spend_share_pct ?? row.spend_share ?? null,
    leak_status: normalizeHealthStatus(row.health_status) || row.leak_status || null
  };
}

function extractSeriesArray(root, range = "wow") {
  if (Array.isArray(root)) return root;

  // API shape: { chart: { series: [{ report_date, ... }] }, current_from, current_to }
  if (Array.isArray(root?.chart?.series)) return root.chart.series;
  if (Array.isArray(root?.chart?.data)) return root.chart.data;
  if (Array.isArray(root?.chart?.points)) return root.chart.points;

  const candidates = [
    root?.series,
    root?.points,
    root?.rows,
    root?.chart,
    root?.chart_data,
    root?.chartData,
    root?.items,
    root?.data,
    root?.values,
    root
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;

    if (candidate && typeof candidate === "object") {
      if (Array.isArray(candidate.series)) return candidate.series;
      if (Array.isArray(candidate.points)) return candidate.points;
      if (Array.isArray(candidate.rows)) return candidate.rows;
      if (
        Array.isArray(candidate.data) &&
        (candidate.data.length === 0 || typeof candidate.data[0] === "object")
      ) {
        return candidate.data;
      }
    }

    const ranged = pickRangeSlice(candidate, range);
    if (Array.isArray(ranged)) return ranged;
    if (ranged && typeof ranged === "object") {
      if (Array.isArray(ranged.series)) return ranged.series;
      if (Array.isArray(ranged.chart?.series)) return ranged.chart.series;
      if (Array.isArray(ranged.points)) return ranged.points;
      if (Array.isArray(ranged.rows)) return ranged.rows;
      if (Array.isArray(ranged.data)) return ranged.data;
    }
  }

  // Chart.js style: labels + datasets[{label,data}]
  if (Array.isArray(root?.labels) && Array.isArray(root?.datasets)) {
    return root.labels.map((label, index) => {
      const point = { period: label, label };
      root.datasets.forEach((ds) => {
        const name = String(ds?.label || ds?.key || "value")
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/%/g, "");
        const key =
          name.includes("surplus")
            ? "ad_surplus"
            : name.includes("waste")
              ? "wasted_spend"
              : name.includes("spend")
                ? "spend"
                : name.includes("sale")
                  ? "sales"
                  : name.includes("acos")
                    ? "acos"
                    : name.includes("cpc")
                      ? "cpc"
                      : name.includes("cvr")
                        ? "cvr"
                        : name;
        point[key] = ds?.data?.[index] ?? null;
        if (point.value == null && ds?.data?.[index] != null) {
          point.value = ds.data[index];
        }
      });
      return point;
    });
  }

  if (Array.isArray(root?.labels) && Array.isArray(root?.values)) {
    return root.labels.map((label, index) => ({
      period: label,
      value: root.values[index]
    }));
  }

  // labels + plain numeric data array
  if (
    Array.isArray(root?.labels) &&
    Array.isArray(root?.data) &&
    (root.data.length === 0 || typeof root.data[0] !== "object")
  ) {
    return root.labels.map((label, index) => ({
      period: label,
      value: root.data[index],
      ad_surplus: root.data[index],
      wasted_spend: root.data[index],
      acos: root.data[index],
      cpc: root.data[index],
      cvr: root.data[index]
    }));
  }

  // parallel metric arrays: { labels, spend:[], sales:[] }
  if (Array.isArray(root?.labels)) {
    const metricKeys = ["ad_surplus", "spend", "sales", "acos", "wasted_spend", "cpc", "cvr", "roas"];
    const hasParallel = metricKeys.some((key) => Array.isArray(root[key]));
    if (hasParallel) {
      return root.labels.map((label, index) => {
        const point = { period: label };
        metricKeys.forEach((key) => {
          if (Array.isArray(root[key])) point[key] = root[key][index];
        });
        return point;
      });
    }
  }

  return [];
}

function mapSeriesRow(row) {
  if (!row || typeof row !== "object") return row;
  const normalized = normalizeKpiFields(row);
  const period =
    row.report_date ||
    row.period ||
    row.date ||
    row.label ||
    row.day ||
    row.week ||
    normalized.period ||
    null;

  return {
    ...row,
    ...normalized,
    period,
    report_date: row.report_date || period,
    ad_surplus: normalized.ad_surplus ?? row.value ?? null,
    wasted_spend:
      normalized.wasted_spend ?? (row.value != null && row.ad_surplus == null ? row.value : null)
  };
}

export function normalizeKpiSummary(payload, range = "wow") {
  const root = unwrapDashboardData(payload);
  let scoped = root;

  // Preferred API shape: data.kpis.{spend:{current,previous,change_pct}, ...}
  const nestedFromRoot = flattenNestedKpis(root?.kpis);
  const nestedFromScoped = nestedFromRoot.cur ? null : flattenNestedKpis(root);

  // cards array (new summary shape) or legacy kpis object
  const fromCards = extractKpisFromCards(root.cards || root.metrics || root.kpi_cards);

  if (nestedFromRoot.cur) {
    scoped = root.kpis;
  } else if (hasKpiFields(root?.kpis) && root.kpis.cur == null && root.kpis.current == null) {
    scoped = root.kpis;
  } else {
    const fromKpis = pickRangeSlice(root?.kpis, range);
    const fromRootRange = pickRangeSlice(root, range);
    if (fromKpis && typeof fromKpis === "object") scoped = fromKpis;
    else if (fromRootRange && typeof fromRootRange === "object" && !Array.isArray(fromRootRange)) {
      if (fromRootRange.cur || hasKpiFields(fromRootRange)) scoped = fromRootRange;
    }
  }

  let cur =
    (fromCards && hasKpiFields(fromCards) ? fromCards : null) ||
    nestedFromRoot.cur ||
    nestedFromScoped?.cur ||
    scoped?.cur ||
    scoped?.current ||
    scoped?.kpi ||
    scoped?.summary ||
    root?.summary?.cur ||
    root?.summary?.current ||
    (hasKpiFields(scoped) ? scoped : null) ||
    (hasKpiFields(root?.summary) ? root.summary : null) ||
    (hasKpiFields(root) ? root : null) ||
    {};

  const prev =
    nestedFromRoot.prev ||
    nestedFromScoped?.prev ||
    scoped?.prev ||
    scoped?.previous ||
    root?.prev ||
    root?.previous ||
    root?.summary?.prev ||
    null;

  const meta = root.meta && typeof root.meta === "object" ? root.meta : {};
  const dataRangeObj =
    root.data_range && typeof root.data_range === "object" && !Array.isArray(root.data_range)
      ? root.data_range
      : meta.data_range && typeof meta.data_range === "object" && !Array.isArray(meta.data_range)
        ? meta.data_range
        : null;

  const dateRange =
    dataRangeObj?.from && dataRangeObj?.to
      ? [String(dataRangeObj.from).slice(0, 10), String(dataRangeObj.to).slice(0, 10)]
      : Array.isArray(root.date_range)
        ? root.date_range
        : meta.date_range && Array.isArray(meta.date_range)
          ? meta.date_range
          : scoped?.date_range ||
            (root.current_from && root.current_to
              ? [root.current_from, root.current_to]
              : null) ||
            (root.from && root.to ? [root.from, root.to] : null) ||
            (typeof scoped?.cur === "string" && typeof scoped?.prev === "string"
              ? [scoped.prev, scoped.cur]
              : null);

  const previousDateRange =
    root.previous_from && root.previous_to
      ? [root.previous_from, root.previous_to]
      : null;

  const compareLabel =
    root.compare_label ||
    root.compareLabel ||
    null;

  const currentPeriodLabel =
    root.current_from && root.current_to
      ? String(root.current_from).slice(0, 10) === String(root.current_to).slice(0, 10)
        ? String(root.current_from).slice(0, 10)
        : `${String(root.current_from).slice(0, 10)} to ${String(root.current_to).slice(0, 10)}`
      : null;

  const dataRangeLabel =
    dataRangeObj?.label ||
    (dataRangeObj?.from && dataRangeObj?.to
      ? dataRangeObj.from === dataRangeObj.to
        ? String(dataRangeObj.from).slice(0, 10)
        : `${String(dataRangeObj.from).slice(0, 10)} to ${String(dataRangeObj.to).slice(0, 10)}`
      : null) ||
    currentPeriodLabel;

  return {
    cur: normalizeKpiFields(cur),
    prev: prev && typeof prev === "object" ? normalizeKpiFields(prev) : null,
    meta,
    dateRange: Array.isArray(dateRange) ? dateRange : null,
    previousDateRange,
    compareLabel,
    dataRangeLabel,
    currentPeriodLabel,
    range: root.range || range,
    insight: root.insight || root.insight_text || scoped?.insight || null,
    overlay: root.overlay || null,
    raw: root
  };
}

function extractKpisFromCards(cards) {
  if (!Array.isArray(cards) || !cards.length) return null;

  const CARD_KEY_MAP = {
    ad_spend: "spend",
    spend: "spend",
    ad_sales: "sales",
    sales: "sales",
    ad_surplus: "ad_surplus",
    surplus: "ad_surplus",
    est_profit: "est_profit",
    profit: "est_profit",
    acos: "acos",
    roas: "roas",
    wasted_spend: "wasted_spend",
    waste: "wasted_spend",
    cpc: "cpc",
    cvr: "cvr"
  };

  const out = {};

  for (const card of cards) {
    if (!card || typeof card !== "object") continue;

    const rawKey = String(card.key || card.id || card.metric || card.name || "")
      .trim()
      .toLowerCase();
    if (!rawKey) continue;

    const metricKey = CARD_KEY_MAP[rawKey] || rawKey.replace(/^ad_/, "");
    const current = card.current ?? card.value ?? card.cur ?? card.amount ?? null;
    if (current == null && card.current !== 0) continue;

    out[metricKey] = current;

    const chgKey = metricChangeKey(metricKey);
    const changePct = card.change_pct ?? card.changePct ?? null;
    if (changePct != null) out[chgKey] = changePct;

    if (card.change != null) out[`${metricKey}_change`] = card.change;
    if (card.previous != null) out[`${metricKey}_previous`] = card.previous;
    if (card.lower_is_better != null) {
      out[`${metricKey}_lower_is_better`] = Boolean(card.lower_is_better);
    }
  }

  return hasKpiFields(out) ? out : null;
}

export function normalizeChartSeries(payload, range = "wow") {
  const root = unwrapDashboardData(payload);
  const series = extractSeriesArray(root, range).map(mapSeriesRow).filter(Boolean);

  const dateRange =
    root.current_from && root.current_to
      ? [root.current_from, root.current_to]
      : Array.isArray(root.date_range)
        ? root.date_range
        : null;

  return {
    series,
    meta: {
      title: root.chart?.title || root.title || null,
      subtitle: root.chart?.subtitle || root.subtitle || null,
      range: root.range || range,
      dateRange,
      overlay: root.overlay || null,
      metrics: root.chart?.metrics || null
    }
  };
}

/** Accept raw array or { series } chart payload */
export function asChartSeries(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.series)) return value.series;
  return [];
}

export function normalizeDashboardList(payload, request = {}) {
  const root = unwrapDashboardData(payload);
  const range = request.range || "wow";
  const listEnvelope = isDashboardListEnvelope(root) ? root : null;
  const ranged = listEnvelope ? null : pickRangeSlice(root, range);
  const scoped =
    listEnvelope ||
    (ranged && typeof ranged === "object" && !Array.isArray(ranged) && !Array.isArray(ranged?.rows)
      ? ranged
      : root);

  const rows = Array.isArray(listEnvelope?.data)
    ? listEnvelope.data
    : Array.isArray(root)
      ? root
      : Array.isArray(scoped?.rows)
        ? scoped.rows
        : Array.isArray(scoped?.list)
          ? scoped.list
          : Array.isArray(scoped?.campaigns)
            ? scoped.campaigns
            : Array.isArray(scoped?.items)
              ? scoped.items
              : Array.isArray(scoped?.data)
                ? scoped.data
                : Array.isArray(root.rows)
                  ? root.rows
                  : Array.isArray(root.list)
                    ? root.list
                    : Array.isArray(root.campaigns)
                      ? root.campaigns
                      : Array.isArray(root.data)
                        ? root.data
                        : Array.isArray(root.items)
                          ? root.items
                          : Array.isArray(ranged)
                            ? ranged
                            : [];

  const normalizedRows = rows.map(normalizeDashboardListRow);
  const meta = scoped?.meta ?? root?.meta ?? {};

  const totalRecords =
    Number(
      scoped?.total_records ??
        scoped?.totalRecords ??
        root?.total_records ??
        root?.totalRecords ??
        root?.total ??
        normalizedRows.length
    ) || normalizedRows.length;
  const page = Number(scoped?.page ?? root?.page ?? request.page ?? 1) || 1;
  const limit =
    Number(request.limit ?? scoped?.limit ?? root?.limit ?? normalizedRows.length) ||
    normalizedRows.length ||
    1;
  const totalPages =
    Number(scoped?.total_pages ?? scoped?.totalPages ?? root?.total_pages ?? root?.totalPages) ||
    Math.max(1, Math.ceil(totalRecords / Math.max(limit, 1)));

  const cur =
    scoped?.cur ??
    scoped?.current_period ??
    meta.current_to ??
    root?.cur ??
    root?.current_period ??
    root?.current_to ??
    null;
  const prev =
    scoped?.prev ??
    scoped?.previous_period ??
    meta.previous_to ??
    root?.prev ??
    root?.previous_period ??
    meta.previous_from ??
    root?.current_from ??
    null;

  return {
    data: normalizedRows,
    rows: normalizedRows,
    total_records: totalRecords,
    totalRecords,
    page,
    total_pages: totalPages,
    totalPages,
    cur,
    prev,
    meta,
    summary: scoped?.summary ?? root?.summary ?? null,
    dateRange:
      meta?.data_range?.from && meta?.data_range?.to
        ? [meta.data_range.from, meta.data_range.to]
        : root?.current_from && root?.current_to
          ? [root.current_from, root.current_to]
          : Array.isArray(root?.date_range)
            ? root.date_range
            : null,
    filter_name: root?.filter_name ?? root?.filterFields ?? scoped?.filter_name ?? [],
    filterFields: root?.filter_name ?? root?.filterFields ?? scoped?.filter_name ?? []
  };
}

export function normalizeDashboardBundle(payload, range = "wow") {
  const root = unwrapDashboardData(payload);
  const summary = normalizeKpiSummary(
    root.kpis || root.summary || root.overview || root,
    range
  );

  const seriesRoot = root.series || root.charts || root;
  const chartSurplus = normalizeChartSeries(
    root.chart_ad_surplus || root.ad_surplus || { chart: root.chart_ad_surplus, ...root },
    range
  );
  // Prefer nested chart payloads when present on bundle
  const pickChart = (key, fallbackMetrics = {}) => {
    if (root[key]) return normalizeChartSeries(root[key], range);
    if (root.charts?.[key]) return normalizeChartSeries(root.charts[key], range);
    return normalizeChartSeries({ ...fallbackMetrics, series: asChartSeries(seriesRoot) }, range);
  };

  const chartSpendSales = pickChart("chart_spend_sales", seriesRoot);
  const chartAcos = pickChart("chart_acos", seriesRoot);
  const chartWaste = pickChart("chart_wasted_spend", seriesRoot);
  const chartCpc = pickChart("chart_cpc", seriesRoot);
  const chartCvr = pickChart("chart_cvr", seriesRoot);

  // If top-level looks like a single chart response, use it for surplus
  const surplusFromRoot =
    Array.isArray(root?.chart?.series) ? normalizeChartSeries(root, range) : chartSurplus;

  const list = normalizeDashboardList(root.leak || root.list || root.campaigns || root, {
    range
  });

  return {
    summary: {
      ...summary,
      dateRange:
        summary.dateRange ||
        surplusFromRoot.meta?.dateRange ||
        (root.current_from && root.current_to ? [root.current_from, root.current_to] : null)
    },
    charts: {
      ad_surplus: asChartSeries(surplusFromRoot),
      spend_sales: asChartSeries(chartSpendSales),
      acos: asChartSeries(chartAcos),
      wasted_spend: asChartSeries(chartWaste),
      cpc: asChartSeries(chartCpc),
      cvr: asChartSeries(chartCvr)
    },
    chartMeta: {
      ad_surplus: surplusFromRoot.meta,
      spend_sales: chartSpendSales.meta,
      acos: chartAcos.meta,
      wasted_spend: chartWaste.meta,
      cpc: chartCpc.meta,
      cvr: chartCvr.meta
    },
    list,
    searchTerms: normalizeDashboardList(root.searchterm || root.search_terms || root.searchTerms || {}, {
      range
    }),
    placements: normalizeDashboardList(root.placement || root.placements || {}, { range }),
    matchTypes: normalizeDashboardList(root.matchtype || root.match_types || root.matchTypes || {}, {
      range
    }),
    raw: root
  };
}

export function aggregateKpisFromRows(rows = []) {
  if (!Array.isArray(rows) || !rows.length) return null;
  const spend = rows.reduce((sum, row) => sum + (Number(row.spend) || 0), 0);
  const sales = rows.reduce((sum, row) => sum + (Number(row.sales) || 0), 0);
  const wasted = rows.reduce((sum, row) => sum + (Number(row.wasted_spend) || 0), 0);
  const surplus = rows.reduce(
    (sum, row) =>
      sum +
      (row.ad_surplus != null ? Number(row.ad_surplus) : (Number(row.sales) || 0) - (Number(row.spend) || 0)),
    0
  );
  return normalizeKpiFields({
    spend,
    sales,
    ad_surplus: surplus,
    wasted_spend: wasted,
    acos: sales > 0 ? (spend / sales) * 100 : null,
    roas: spend > 0 ? sales / spend : null,
    spend_chg: null,
    sales_chg: null,
    surplus_chg: null,
    acos_chg: null,
    wasted_chg: null
  });
}

export function hasKpiValues(kpi) {
  if (!kpi || typeof kpi !== "object") return false;
  const ok = (v) => v != null && typeof v !== "object" && Number.isFinite(Number(v));
  return (
    ok(kpi.spend) ||
    ok(kpi.sales) ||
    ok(kpi.ad_surplus) ||
    ok(kpi.acos) ||
    ok(kpi.roas) ||
    ok(kpi.wasted_spend) ||
    ok(kpi.est_profit)
  );
}

export function resolveCurrencyCode(code) {
  const normalized = String(code || "").trim().toUpperCase();
  return normalized || "INR";
}

export function formatCurrency(value, currencyCode = "INR") {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  const num = Number(value);
  const code = resolveCurrencyCode(currencyCode);
  const abs = Math.abs(num).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  return num < 0 ? `-${abs} ${code}` : `${abs} ${code}`;
}

export function formatPercent(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return `${Number(value).toFixed(digits)}%`;
}

export function formatRoas(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return `${Number(value).toFixed(2)}x`;
}

export function formatCpc(value, currencyCode = "INR") {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  const code = resolveCurrencyCode(currencyCode);
  return `${Number(value).toFixed(2)} ${code}`;
}

export function formatChangePct(value, { invert = false, lowerIsBetter } = {}) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return { text: "—", tone: "neutral" };
  }
  const num = Number(value);
  const shouldInvert = lowerIsBetter != null ? Boolean(lowerIsBetter) : invert;
  const arrow = num > 0 ? "▲" : num < 0 ? "▼" : "●";
  const positive = shouldInvert ? num < 0 : num > 0;
  const tone = num === 0 ? "neutral" : positive ? "positive" : "negative";
  return {
    text: `${arrow} ${Math.abs(num).toFixed(1)}%`,
    tone
  };
}

function resolveKpiChangeKey(metricKey) {
  if (metricKey === "ad_surplus" || metricKey === "surplus") return "surplus_chg";
  if (metricKey === "wasted_spend" || metricKey === "waste") return "wasted_chg";
  if (metricKey === "est_profit") return "est_profit_chg";
  return `${metricKey}_chg`;
}

export function getKpiLowerIsBetter(kpi = {}, metricKey) {
  const explicit = kpi[`${metricKey}_lower_is_better`];
  if (explicit != null) return Boolean(explicit);
  if (metricKey === "acos" || metricKey === "cpc" || metricKey === "wasted_spend") return true;
  return false;
}

export function formatKpiChange(kpi = {}, metricKey, changeKey) {
  const chgKey = changeKey || resolveKpiChangeKey(metricKey);
  return formatChangePct(kpi[chgKey], {
    lowerIsBetter: getKpiLowerIsBetter(kpi, metricKey)
  });
}

export function formatChangeMoney(value, currencyCode = "INR") {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return { text: "—", tone: "neutral" };
  }
  const num = Number(value);
  const arrow = num > 0 ? "▲" : num < 0 ? "▼" : "●";
  const tone = num === 0 ? "neutral" : num > 0 ? "positive" : "negative";
  return {
    text: `${arrow} ${formatCurrency(Math.abs(num), currencyCode)}`,
    tone
  };
}

export function changeToneClass(tone) {
  if (tone === "positive") return "text-green-600";
  if (tone === "negative") return "text-red-600";
  return "text-[var(--ink-muted)]";
}

export function estProfit(sales, spend, marginPct) {
  const s = Number(sales) || 0;
  const sp = Number(spend) || 0;
  const m = Number(marginPct) || 0;
  return s * (m / 100) - sp;
}

export function campaignLeakStatus(row = {}) {
  const fromApi = normalizeHealthStatus(row.health_status) || row.leak_status;
  if (fromApi) return fromApi;

  const roas = row.roas == null ? null : Number(row.roas);
  const acosChg = Number(row.acos_chg_pct ?? row.acos_delta) || 0;
  if (roas != null && roas < 1) return "high";
  if (acosChg > 15 || (roas != null && roas < 2)) return "medium";
  return "healthy";
}

export function searchTermAction(row = {}, avgAcos = 0) {
  const orders = Number(row.orders) || 0;
  const wasted = Number(row.wasted_spend) || 0;
  const acos = Number(row.acos) || 0;
  const acosChg = Number(row.acos_chg_pct) || 0;

  if (wasted > 0 && orders < 1) return "negate";
  if (acosChg > 20 || (avgAcos > 0 && acos > avgAcos * 1.3)) return "watch";
  return "scale";
}

export function formatChartLabel(period, rangeId = "wow") {
  if (!period) return "";
  const raw = String(period);
  const d = new Date(/^\d{4}-\d{2}-\d{2}/.test(raw) ? `${raw.slice(0, 10)}T00:00:00` : raw);
  if (Number.isNaN(d.getTime())) return raw;

  // WoW chart points are often daily within the week window
  if (rangeId === "wow" || rangeId === "daily") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  if (rangeId === "mom") {
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
  if (rangeId === "qoq") {
    const q = Math.floor(d.getMonth() / 3) + 1;
    return `Q${q} ${d.getFullYear()}`;
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function withChartLabels(series = [], rangeId = "wow") {
  return (Array.isArray(series) ? series : [])
    .map((row) => {
      const period = row.period || row.report_date || row.date || row.label || null;
      return {
        ...row,
        period,
        report_date: row.report_date || period,
        formattedDate: formatChartLabel(period, rangeId)
      };
    })
    .sort((a, b) => String(a.period || "").localeCompare(String(b.period || "")));
}

/** Match TableView list query keys so chart prefetch and table share one cache entry. */
export function buildDashboardTableQueryKey(prefix, options = {}) {
  const {
    storeId,
    page = 1,
    limit = 15,
    search = "",
    filters = [],
    sortBy = "",
    sortOrder = "DESC",
    extraParams = {}
  } = options;

  const sortParams = sortBy ? { sortby: sortBy, sortorder: sortOrder } : {};
  const trimmedSearch = String(search || "").trim();
  const payload = {
    store_id: Number(storeId) || storeId,
    page,
    limit,
    filters,
    ...sortParams,
    ...extraParams
  };
  if (trimmedSearch) payload.search = trimmedSearch;

  return {
    queryKey: [
      ...(Array.isArray(prefix) ? prefix : [prefix]),
      {
        storeId: String(storeId || ""),
        page,
        limit,
        search: trimmedSearch,
        filters,
        ...sortParams,
        ...extraParams
      }
    ],
    payload
  };
}
