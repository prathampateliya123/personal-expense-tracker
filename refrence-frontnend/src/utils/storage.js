import {
  AMAZON_REGISTRATION_KEY,
  CREATE_RULE_WIZARD_COOKIE,
  DASHBOARD_PREFS_COOKIE,
  LEGACY_SELECTED_STORE_KEY,
  PENDING_ACCOUNT_TYPE_KEY,
  PENDING_ADS_CONNECT_STORE_ID_KEY,
  REPORT_COLUMNS_COOKIE,
  REPORT_DATE_RANGE_COOKIE,
  REPORT_FILTERS_COOKIE,
  REPORT_PREFS_COOKIE,
  REPORT_PREFS_STORAGE_KEY,
  STORE_ID_NAME
} from "./constants";
import {
  getCookie,
  setCookie,
  removeCookie,
  readCookieObject,
  readChunkedCookieObject,
  writeChunkedCookieObject,
  removeChunkedCookie
} from "./cookie";
import {
  formatIsoDate,
  toDateOnly,
  normalizeFilterType,
  isBetweenOperator
} from "./report";
import {
  getLocalJson,
  getLocalStorage,
  getSessionJson,
  getSessionStorage,
  removeLocalStorage,
  removeSessionStorage,
  setLocalJson,
  setLocalStorage,
  setSessionJson,
  setSessionStorage
} from "./localstorage";

export const savePendingAmazonRegistration = (payload) => {
  setSessionJson(AMAZON_REGISTRATION_KEY, payload);
};

export const getPendingAmazonRegistration = () => getSessionJson(AMAZON_REGISTRATION_KEY);

export const clearPendingAmazonRegistration = () => {
  removeSessionStorage(AMAZON_REGISTRATION_KEY);
};

export const getSelectedStoreId = () => {
  const fromCookie = getCookie(STORE_ID_NAME);
  if (fromCookie) return fromCookie;

  const legacy = getLocalStorage(LEGACY_SELECTED_STORE_KEY);
  if (legacy) {
    setCookie(STORE_ID_NAME, legacy);
    removeLocalStorage(LEGACY_SELECTED_STORE_KEY);
    return legacy;
  }

  return null;
};

export const setSelectedStoreId = (storeId) => {
  if (storeId == null || storeId === "") {
    removeCookie(STORE_ID_NAME);
    removeLocalStorage(LEGACY_SELECTED_STORE_KEY);
    return;
  }

  setCookie(STORE_ID_NAME, String(storeId));
  removeLocalStorage(LEGACY_SELECTED_STORE_KEY);
};

export const getPendingAccountType = () => getSessionStorage(PENDING_ACCOUNT_TYPE_KEY);

export const setPendingAccountType = (accountType) => {
  if (!accountType) {
    removeSessionStorage(PENDING_ACCOUNT_TYPE_KEY);
    return;
  }
  setSessionStorage(PENDING_ACCOUNT_TYPE_KEY, String(accountType));
};

export const clearPendingAccountType = () => {
  setPendingAccountType("");
};

export const getPendingAdsConnectStoreId = () =>
  getSessionStorage(PENDING_ADS_CONNECT_STORE_ID_KEY);

export const setPendingAdsConnectStoreId = (storeId) => {
  if (storeId == null || storeId === "") {
    removeSessionStorage(PENDING_ADS_CONNECT_STORE_ID_KEY);
    return;
  }
  setSessionStorage(PENDING_ADS_CONNECT_STORE_ID_KEY, String(storeId));
};

export const clearPendingAdsConnectStoreId = () => {
  setPendingAdsConnectStoreId("");
};

export const normalizeStoreListResponse = (data) => {
  const list = Array.isArray(data?.data) ? data.data : [];
  return list.map(normalizeStoreFromApi).filter(Boolean);
};

export const normalizeStoreFromApi = (store) => {
  if (!store || typeof store !== "object" || store.id == null || store.id === "") {
    return null;
  }

  const marketplace_json = Array.isArray(store.marketplace_json)
    ? store.marketplace_json
    : [];
  const primary = marketplace_json[0] || {};
  const syncValue = Number(store.sync_per);

  return {
    id: String(store.id),
    user_id: store.user_id ?? null,
    brand_name: store.brand_name || "",
    store_name: store.store_name || "",
    country_code: store.country_code || "",
    marketplace_id: store.marketplace_id || "",
    account_type: store.account_type || "",
    is_sp_connected: Boolean(store.is_sp_connected),
    is_ads_connected: Boolean(store.is_ads_connected),
    status: store.status || "",
    marketplace_json,
    created_at: store.created_at || "",
    last_sync_at: store.last_sync_at || "",
    sync_status: store.sync_status || "",
    sync_per: Number.isFinite(syncValue)
      ? Math.min(100, Math.max(0, Math.round(syncValue)))
      : 0,
    timezone: primary.timezone || "",
    currency_code: primary.currencyCode || store.currency_code || store.currencyCode || "INR",
    profile_id: primary.profileId ?? null,
    amazon_user_id: primary.accountInfo?.id || ""
  };
};

export const getAccountNameFromProfile = (profile) =>
  profile?.account_info?.name ||
  profile?.raw?.accountInfo?.name ||
  "Untitled store";

export const getAccountTypeFromProfile = (profile) =>
  profile?.account_info?.type ||
  profile?.raw?.accountInfo?.type ||
  "seller";

export const getMarketplaceIdFromProfile = (profile) =>
  profile?.account_info?.marketplaceStringId ||
  profile?.raw?.accountInfo?.marketplaceStringId ||
  "";

export const getAmazonUserIdFromProfile = (profile) =>
  profile?.account_info?.id ||
  profile?.raw?.accountInfo?.id ||
  "";

export const extractCreatedStoreId = (data) => {
  const candidates = [
    data?.data?.store_id,
    data?.data?.store?.id,
    data?.data?.store?._id,
    data?.data?.id,
    data?.data?._id,
    data?.store_id,
    data?.store?.id,
    data?.id
  ];

  const found = candidates.find((value) => value != null && value !== "");
  return found != null ? String(found) : "";
};

export const buildCreateStorePayload = ({
  profile,
  tokens = {},
  brandName = ""
}) => {
  const storeName = getAccountNameFromProfile(profile);
  const accessToken = tokens.access_token || "";
  const refreshToken = tokens.refresh_token || "";
  const accountInfo =
    profile?.account_info || profile?.raw?.accountInfo || {};

  return {
    brand_name: brandName || storeName,
    store_name: storeName,
    store_country_name: profile?.country_code || "",
    marketplace_id: getMarketplaceIdFromProfile(profile),
    profile_id: profile?.profile_id ?? null,
    amazon_user_id: getAmazonUserIdFromProfile(profile),
    region: profile?.region || "",
    access_token: accessToken,
    refresh_token: refreshToken,
    currency_code: profile?.currency_code || profile?.raw?.currencyCode || "",
    timezone: profile?.timezone || profile?.raw?.timezone || "",
    account_info: accountInfo
  };
};

function emptyTablePrefs() {
  return {
    hiddenColumns: [],
    filters: [],
    dateRange: null
  };
}

function normalizeTablePrefs(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return emptyTablePrefs();
  }

  const hiddenColumns = Array.isArray(entry.hiddenColumns)
    ? [...new Set(entry.hiddenColumns.map(String).filter(Boolean))]
    : [];

  const filters = Array.isArray(entry.filters)
    ? entry.filters
      .map((filter, index) => sanitizeFilter(filter, index))
      .filter(Boolean)
    : [];

  const dateRange = sanitizeDateRange(entry.dateRange);

  return {
    hiddenColumns,
    filters,
    dateRange
  };
}

function isEmptyTablePrefs(entry) {
  return (
    (!entry.hiddenColumns || entry.hiddenColumns.length === 0) &&
    (!entry.filters || entry.filters.length === 0) &&
    !entry.dateRange
  );
}

function migrateLegacyReportPrefs() {
  const columns = readCookieObject(REPORT_COLUMNS_COOKIE);
  const filters = readCookieObject(REPORT_FILTERS_COOKIE);
  const dateRanges = readCookieObject(REPORT_DATE_RANGE_COOKIE);
  const tableIds = new Set([
    ...Object.keys(columns),
    ...Object.keys(filters),
    ...Object.keys(dateRanges)
  ]);

  if (!tableIds.size) return {};

  const merged = {};
  for (const tableId of tableIds) {
    const next = emptyTablePrefs();
    if (Array.isArray(columns[tableId])) {
      next.hiddenColumns = [...new Set(columns[tableId].map(String).filter(Boolean))];
    }
    if (Array.isArray(filters[tableId])) {
      next.filters = filters[tableId]
        .map((filter, index) => sanitizeFilter(filter, index))
        .filter(Boolean);
    }
    next.dateRange = sanitizeDateRange(dateRanges[tableId]);
    if (!isEmptyTablePrefs(next)) {
      merged[String(tableId)] = next;
    }
  }

  return merged;
}

function clearLegacyReportCookies() {
  removeCookie(REPORT_COLUMNS_COOKIE);
  removeCookie(REPORT_FILTERS_COOKIE);
  removeCookie(REPORT_DATE_RANGE_COOKIE);
}

function normalizePrefsMap(prefs) {
  if (!prefs || typeof prefs !== "object" || Array.isArray(prefs)) return {};
  const normalized = {};
  for (const [tableId, entry] of Object.entries(prefs)) {
    if (!tableId) continue;
    const next = normalizeTablePrefs(entry);
    if (!isEmptyTablePrefs(next)) {
      normalized[String(tableId)] = next;
    }
  }
  return normalized;
}

function persistReportPrefs(cleaned) {
  removeLocalStorage(REPORT_PREFS_STORAGE_KEY);
  clearLegacyReportCookies();

  if (!cleaned || !Object.keys(cleaned).length) {
    removeChunkedCookie(REPORT_PREFS_COOKIE);
    removeCookie(REPORT_PREFS_COOKIE);
    return;
  }

  writeChunkedCookieObject(REPORT_PREFS_COOKIE, cleaned);
}

const STORE_TABLE_PREFIX = "store:";

export function scopeTableId(tableId, storeId = getSelectedStoreId()) {
  const base = String(tableId || "").trim() || "report";
  if (base.startsWith(STORE_TABLE_PREFIX)) return base;
  const store = String(storeId || "").trim() || "none";
  return `${STORE_TABLE_PREFIX}${store}:${base}`;
}

function migratePrefsToStoreScope(prefs) {
  const storeId = String(getSelectedStoreId() || "").trim();
  if (!storeId || !prefs || typeof prefs !== "object") return prefs || {};

  let changed = false;
  const next = {};
  for (const [key, value] of Object.entries(prefs)) {
    if (!key) continue;
    if (key.startsWith(STORE_TABLE_PREFIX)) {
      next[key] = value;
      continue;
    }
    const scoped = `${STORE_TABLE_PREFIX}${storeId}:${key}`;
    if (!next[scoped]) next[scoped] = value;
    changed = true;
  }

  if (!changed) return prefs;
  persistReportPrefs(next);
  return next;
}

export function getReportPrefs() {
  const fromCookie = normalizePrefsMap(readChunkedCookieObject(REPORT_PREFS_COOKIE));
  if (Object.keys(fromCookie).length) return migratePrefsToStoreScope(fromCookie);

  const fromPlain = normalizePrefsMap(readCookieObject(REPORT_PREFS_COOKIE));
  if (Object.keys(fromPlain).length) {
    const scoped = migratePrefsToStoreScope(fromPlain);
    persistReportPrefs(scoped);
    return scoped;
  }

  const fromLocal = normalizePrefsMap(getLocalJson(REPORT_PREFS_STORAGE_KEY));
  if (Object.keys(fromLocal).length) {
    const scoped = migratePrefsToStoreScope(fromLocal);
    persistReportPrefs(scoped);
    return scoped;
  }

  const migrated = migrateLegacyReportPrefs();
  if (Object.keys(migrated).length) {
    const scoped = migratePrefsToStoreScope(migrated);
    persistReportPrefs(scoped);
    return scoped;
  }
  return migrated;
}

export function setReportPrefs(prefs) {
  if (!prefs || typeof prefs !== "object" || Array.isArray(prefs)) {
    persistReportPrefs({});
    return;
  }

  const cleaned = {};
  for (const [tableId, entry] of Object.entries(prefs)) {
    if (!tableId) continue;
    const next = normalizeTablePrefs(entry);
    if (isEmptyTablePrefs(next)) continue;
    cleaned[String(tableId)] = {
      ...(next.hiddenColumns.length ? { hiddenColumns: next.hiddenColumns } : {}),
      ...(next.filters.length ? { filters: next.filters } : {}),
      ...(next.dateRange ? { dateRange: next.dateRange } : {})
    };
  }

  persistReportPrefs(cleaned);
}

function getTablePrefs(tableId, storeId) {
  const scopedId = scopeTableId(tableId, storeId);
  if (!scopedId) return emptyTablePrefs();
  return normalizeTablePrefs(getReportPrefs()[scopedId]);
}

function updateTablePrefs(tableId, updater, storeId) {
  const scopedId = scopeTableId(tableId, storeId);
  if (!scopedId) return;

  const prefs = getReportPrefs();
  const current = normalizeTablePrefs(prefs[scopedId]);
  const next = normalizeTablePrefs(updater(current));

  if (isEmptyTablePrefs(next)) {
    delete prefs[scopedId];
  } else {
    prefs[scopedId] = {
      ...(next.hiddenColumns.length ? { hiddenColumns: next.hiddenColumns } : {}),
      ...(next.filters.length ? { filters: next.filters } : {}),
      ...(next.dateRange ? { dateRange: next.dateRange } : {})
    };
  }

  setReportPrefs(prefs);
}

export function getHiddenColumns(tableId) {
  return getTablePrefs(tableId).hiddenColumns;
}

export function setHiddenColumns(tableId, hiddenKeys) {
  updateTablePrefs(tableId, (current) => ({
    ...current,
    hiddenColumns: Array.isArray(hiddenKeys)
      ? [...new Set(hiddenKeys.map(String).filter(Boolean))]
      : []
  }));
}

export function resolveTableId(queryKey) {
  if (Array.isArray(queryKey) && queryKey.length) {
    return queryKey.map(String).filter(Boolean).join(":");
  }
  if (typeof queryKey === "string" && queryKey.trim()) {
    return queryKey.trim();
  }
  return "report";
}

function sanitizeFilter(filter, index = 0) {
  if (!filter || typeof filter !== "object") return null;

  const field = String(
    filter.displayName || filter.field || filter.fieldName || ""
  ).trim();
  const fieldName = String(filter.fieldName || filter.field || field).trim();
  const operator = String(filter.operator || "").trim();
  if (!field || !operator) return null;

  const type = normalizeFilterType(filter.type || filter.field_type);
  const normalizedOperator = isBetweenOperator(operator) ? "between" : operator;

  const next = {
    id: String(filter.id || `${fieldName}-${normalizedOperator}-${index}`),
    field,
    fieldName,
    displayName: field,
    type,
    operator: normalizedOperator,
    operators: Array.isArray(filter.operators) ? filter.operators : []
  };

  if (filter.fieldId != null) next.fieldId = filter.fieldId;

  if (isBetweenOperator(normalizedOperator)) {
    const value = String(filter.value ?? "").trim();
    const valueTo = String(filter.valueTo ?? filter.value_to ?? "").trim();
    if (!value || !valueTo) return null;
    next.value = value;
    next.valueTo = valueTo;
    return next;
  }

  if (operator === "is_any_of") {
    const values = Array.isArray(filter.values)
      ? filter.values.map((item) => String(item).trim()).filter(Boolean)
      : String(filter.value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    if (!values.length) return null;
    next.values = values;
    next.value = values.join(", ");
    return next;
  }

  const value = String(filter.value ?? "").trim();
  if (!value) return null;
  next.value = value;
  return next;
}

export function getAppliedFilters(tableId) {
  return getTablePrefs(tableId).filters;
}

export function setAppliedFiltersForTable(tableId, filters) {
  updateTablePrefs(tableId, (current) => ({
    ...current,
    filters: Array.isArray(filters)
      ? filters.map((filter, index) => sanitizeFilter(filter, index)).filter(Boolean)
      : []
  }));
}

const VALID_DATE_OPERATORS = new Set(["on", "before", "after", "between"]);

export function sanitizeDateRange(range) {
  if (!range || typeof range !== "object") return null;

  const operatorRaw = String(range.operator || "between").trim().toLowerCase();
  const operator = VALID_DATE_OPERATORS.has(operatorRaw) ? operatorRaw : "between";
  const field = String(range.field || range.fieldName || "").trim() || null;

  const startDate = formatIsoDate(
    toDateOnly(range.startDate || range.start_date || range.value)
  );
  const endDateRaw = formatIsoDate(
    toDateOnly(range.endDate || range.end_date || range.valueTo)
  );

  const presetRaw = range.preset;
  const preset =
    presetRaw == null || presetRaw === ""
      ? null
      : String(presetRaw).trim() || null;

  if (operator === "between") {
    if (!startDate || !endDateRaw) return null;
    const start = toDateOnly(startDate);
    const end = toDateOnly(endDateRaw);
    const ordered =
      start && end && start.getTime() > end.getTime()
        ? { startDate: endDateRaw, endDate: startDate }
        : { startDate, endDate: endDateRaw };

    return {
      operator,
      startDate: ordered.startDate,
      endDate: ordered.endDate,
      preset,
      ...(field ? { field } : {})
    };
  }

  if (!startDate) return null;

  return {
    operator,
    startDate,
    endDate: null,
    preset,
    ...(field ? { field } : {})
  };
}

export function getDateRangeForTable(tableId) {
  return getTablePrefs(tableId).dateRange;
}

export function setDateRangeForTable(tableId, range) {
  updateTablePrefs(tableId, (current) => ({
    ...current,
    dateRange: sanitizeDateRange(range)
  }));
}

function clampWizardStep(step) {
  const n = Number(step);
  if (!Number.isFinite(n)) return 1;
  return Math.min(7, Math.max(1, Math.round(n)));
}

function cloneJson(value, fallback) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

function sanitizeRuleBlocks(ruleBlocks) {
  if (!Array.isArray(ruleBlocks) || !ruleBlocks.length) return [];
  return cloneJson(ruleBlocks, []).filter((block) => {
    if (!block || typeof block !== "object") return false;
    if (String(block.kind || "").toLowerCase() === "else") return true;
    return Boolean(block.conditions);
  });
}

function sanitizeWizardForm(form) {
  if (!form || typeof form !== "object" || Array.isArray(form)) return null;

  const selectedProductIds = Array.isArray(form.selectedProductIds)
    ? form.selectedProductIds.map((id) => String(id)).filter(Boolean)
    : [];
  const selectedProducts = Array.isArray(form.selectedProducts)
    ? form.selectedProducts
      .map((item) => {
        if (!item || typeof item !== "object") {
          const id = String(item || "").trim();
          return id ? { productId: id } : null;
        }
        const productId = String(
          item.productId ?? item.product_id ?? item.advertised_product_id ?? item.id ?? ""
        ).trim();
        const asin = String(item.asin ?? item.advertised_asin ?? "").trim();
        const sku = String(item.sku ?? item.advertised_sku ?? "").trim();
        const campaignId = String(item.campaignId ?? item.campaign_id ?? "").trim();
        const adGroupId = String(item.adGroupId ?? item.ad_group_id ?? "").trim();
        if (!productId && !asin && !sku) return null;
        return {
          productId: productId || asin || sku,
          ...(asin ? { asin } : {}),
          ...(sku ? { sku } : {}),
          ...(campaignId ? { campaignId } : {}),
          ...(adGroupId ? { adGroupId } : {})
        };
      })
      .filter(Boolean)
    : [];
  const resolvedProducts =
    selectedProducts.length > 0
      ? selectedProducts
      : selectedProductIds.map((id) => ({ productId: id }));
  const ruleBlocks = sanitizeRuleBlocks(form.ruleBlocks);
  const hours = Array.isArray(form.hours)
    ? form.hours.map((h) => Number(h)).filter((h) => Number.isFinite(h))
    : [];
  const daysOfWeek = Array.isArray(form.daysOfWeek)
    ? form.daysOfWeek.map(String).filter(Boolean)
    : [];
  const daysOfMonth = Array.isArray(form.daysOfMonth)
    ? form.daysOfMonth.map((d) => Number(d)).filter((d) => Number.isFinite(d))
    : [];

  const frequency = ["weekly", "monthly"].includes(form.frequency)
    ? form.frequency
    : "weekly";
  const ruleLevel = form.ruleLevel === "account" ? "account" : "product";

  return {
    name: String(form.name ?? ""),
    ruleLevel,
    targetType: String(form.targetType ?? ""),
    source: String(form.source || form.targetType || ""),
    ruleBlocks,
    selectedProductIds,
    selectedProducts: resolvedProducts,
    lookbackDays:
      form.lookbackDays === "" || form.lookbackDays == null || !Number.isFinite(Number(form.lookbackDays))
        ? form.lookbackDays === "" || form.lookbackDays == null
          ? ""
          : 7
        : Number(form.lookbackDays),
    waitDays:
      form.waitDays === "" || form.waitDays == null || !Number.isFinite(Number(form.waitDays))
        ? form.waitDays === "" || form.waitDays == null
          ? ""
          : 3
        : Number(form.waitDays),
    frequency,
    hours,
    daysOfWeek,
    daysOfMonth,
    notifyPass: String(form.notifyPass ?? ""),
    notifyFail: String(form.notifyFail ?? ""),
    isMasterRule: Boolean(form.isMasterRule)
  };
}

function buildWizardDraftPayload({ step, form, maxReachedStep } = {}) {
  const sanitizedForm = sanitizeWizardForm(form);
  if (!sanitizedForm) return null;
  const clampedStep = clampWizardStep(step);
  const clampedMax = Math.max(
    clampedStep,
    clampWizardStep(maxReachedStep ?? clampedStep)
  );
  return {
    step: clampedStep,
    maxReachedStep: clampedMax,
    form: sanitizedForm,
    updatedAt: Date.now()
  };
}

function parseWizardDraft(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const form = sanitizeWizardForm(raw.form);
  if (!form) return null;
  const step = clampWizardStep(raw.step);
  const maxReachedStep = Math.max(
    step,
    clampWizardStep(raw.maxReachedStep ?? step)
  );
  return {
    step,
    maxReachedStep,
    form,
    updatedAt: Number(raw.updatedAt) || Date.now()
  };
}

function readWizardDraftMap() {
  removeChunkedCookie(CREATE_RULE_WIZARD_COOKIE);
  const raw = getLocalJson(CREATE_RULE_WIZARD_COOKIE);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

  if (raw.form) {
    const storeId = String(getSelectedStoreId() || "").trim();
    const draft = parseWizardDraft(raw);
    if (!storeId || !draft) return {};
    const migrated = { [storeId]: draft };
    setLocalJson(CREATE_RULE_WIZARD_COOKIE, migrated);
    return migrated;
  }

  return raw;
}

export function getCreateRuleWizardDraft(storeId = getSelectedStoreId()) {
  const id = String(storeId || "").trim();
  if (!id) return null;
  return parseWizardDraft(readWizardDraftMap()[id]);
}

export function setCreateRuleWizardDraft({
  step,
  form,
  maxReachedStep,
  storeId = getSelectedStoreId()
} = {}) {
  const id = String(storeId || "").trim();
  const payload = buildWizardDraftPayload({ step, form, maxReachedStep });
  if (!id || !payload) {
    clearCreateRuleWizardDraft(id);
    return;
  }

  const map = readWizardDraftMap();
  map[id] = payload;
  setLocalJson(CREATE_RULE_WIZARD_COOKIE, map);
  removeChunkedCookie(CREATE_RULE_WIZARD_COOKIE);
}

export function clearCreateRuleWizardDraft(storeId = getSelectedStoreId()) {
  removeChunkedCookie(CREATE_RULE_WIZARD_COOKIE);
  const id = String(storeId || "").trim();
  if (!id) {
    removeLocalStorage(CREATE_RULE_WIZARD_COOKIE);
    return;
  }

  const map = readWizardDraftMap();
  delete map[id];
  if (!Object.keys(map).length) {
    removeLocalStorage(CREATE_RULE_WIZARD_COOKIE);
    return;
  }
  setLocalJson(CREATE_RULE_WIZARD_COOKIE, map);
}

export function clearAllCreateRuleWizardDrafts() {
  removeChunkedCookie(CREATE_RULE_WIZARD_COOKIE);
  removeLocalStorage(CREATE_RULE_WIZARD_COOKIE);
}

const STORE_DASHBOARD_PREFIX = "store:";

function emptyDashboardPrefs() {
  return {
    dateRange: null,
    overlayProfit: false,
    marginPct: 10
  };
}

function normalizeDashboardPrefs(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return emptyDashboardPrefs();
  }

  const dateRange = sanitizeDateRange(entry.dateRange);
  const overlayProfit = Boolean(entry.overlayProfit);
  let marginPct = Number(entry.marginPct);
  if (!Number.isFinite(marginPct)) marginPct = 10;
  marginPct = Math.min(95, Math.max(1, Math.round(marginPct)));

  return {
    dateRange,
    overlayProfit,
    marginPct
  };
}

function scopeDashboardStoreId(storeId) {
  const store = String(storeId || getSelectedStoreId() || "").trim();
  if (!store || store === "0") return "";
  return `${STORE_DASHBOARD_PREFIX}${store}`;
}

function readDashboardPrefsMap() {
  const fromChunked = readChunkedCookieObject(DASHBOARD_PREFS_COOKIE);
  if (fromChunked && typeof fromChunked === "object" && Object.keys(fromChunked).length) {
    return fromChunked;
  }

  const fromPlain = readCookieObject(DASHBOARD_PREFS_COOKIE);
  if (fromPlain && typeof fromPlain === "object" && Object.keys(fromPlain).length) {
    persistDashboardPrefsMap(fromPlain);
    return fromPlain;
  }

  return {};
}

function dashboardPrefsToStored(entry) {
  const next = normalizeDashboardPrefs(entry);
  if (!next.dateRange && !next.overlayProfit && next.marginPct === 10) return null;
  return {
    ...(next.dateRange ? { dateRange: next.dateRange } : {}),
    overlayProfit: next.overlayProfit,
    marginPct: next.marginPct
  };
}

function persistDashboardPrefsMap(map) {
  if (!map || typeof map !== "object" || Array.isArray(map)) {
    removeChunkedCookie(DASHBOARD_PREFS_COOKIE);
    removeCookie(DASHBOARD_PREFS_COOKIE);
    return;
  }

  const cleaned = {};
  for (const [storeKey, entry] of Object.entries(map)) {
    if (!storeKey) continue;
    const stored = dashboardPrefsToStored(entry);
    if (stored) cleaned[String(storeKey)] = stored;
  }

  if (!Object.keys(cleaned).length) {
    removeChunkedCookie(DASHBOARD_PREFS_COOKIE);
    removeCookie(DASHBOARD_PREFS_COOKIE);
    return;
  }

  writeChunkedCookieObject(DASHBOARD_PREFS_COOKIE, cleaned);
}

function updateDashboardPrefs(storeId, updater) {
  const scopedId = scopeDashboardStoreId(storeId);
  if (!scopedId) return emptyDashboardPrefs();

  const map = readDashboardPrefsMap();
  const current = normalizeDashboardPrefs(map[scopedId]);
  const next = normalizeDashboardPrefs(updater(current));
  const stored = dashboardPrefsToStored(next);

  if (!stored) {
    delete map[scopedId];
  } else {
    map[scopedId] = stored;
  }

  persistDashboardPrefsMap(map);
  return next;
}

export function getDashboardPrefs(storeId) {
  const scopedId = scopeDashboardStoreId(storeId);
  if (!scopedId) return emptyDashboardPrefs();
  return normalizeDashboardPrefs(readDashboardPrefsMap()[scopedId]);
}

export function setDashboardDateRange(storeId, range) {
  updateDashboardPrefs(storeId, (current) => ({
    ...current,
    dateRange: sanitizeDateRange(range)
  }));
}

export function setDashboardPrefs(
  storeId,
  { dateRange = null, overlayProfit = false, marginPct = 10 } = {}
) {
  return updateDashboardPrefs(storeId, (current) => ({
    dateRange:
      dateRange != null ? sanitizeDateRange(dateRange) : current.dateRange,
    overlayProfit: Boolean(overlayProfit),
    marginPct:
      marginPct == null || marginPct === "" || !Number.isFinite(Number(marginPct))
        ? current.marginPct
        : Number(marginPct)
  }));
}

export function setDashboardProfitOverlay(storeId, { overlayProfit, marginPct } = {}) {
  updateDashboardPrefs(storeId, (current) => ({
    ...current,
    overlayProfit: Boolean(overlayProfit),
    marginPct:
      marginPct == null || marginPct === ""
        ? current.marginPct
        : Number(marginPct)
  }));
}