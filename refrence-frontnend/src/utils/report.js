import * as XLSX from "xlsx";
import {
  ISO_DATE_PARTS_REGEX,
  SLUG_EDGE_DASH_REGEX,
  SLUG_NON_ALNUM_REGEX,
  UNDERSCORE_REGEX,
  WHITESPACE_COLLAPSE_REGEX
} from "./constants";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

export function toDateOnly(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const raw = String(value).trim();
  const match = raw.match(ISO_DATE_PARTS_REGEX);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

export function formatIsoDate(value) {
  const date = toDateOnly(value);
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(value) {
  const date = toDateOnly(value);
  if (!date) return "";
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatRangeLabel(start, end) {
  const from = formatDisplayDate(start);
  const to = formatDisplayDate(end);
  if (!from && !to) return "Select dates";
  if (from && to) return `${from} – ${to}`;
  return from || to;
}

export function addDays(value, amount) {
  const date = toDateOnly(value);
  if (!date) return null;
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function startOfMonth(value) {
  const date = toDateOnly(value);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(value) {
  const date = toDateOnly(value);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function addMonths(value, amount) {
  const date = toDateOnly(value);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function isSameDay(a, b) {
  const left = toDateOnly(a);
  const right = toDateOnly(b);
  if (!left || !right) return false;
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function isBeforeDay(a, b) {
  const left = toDateOnly(a);
  const right = toDateOnly(b);
  if (!left || !right) return false;
  return left.getTime() < right.getTime();
}

export function isAfterDay(a, b) {
  const left = toDateOnly(a);
  const right = toDateOnly(b);
  if (!left || !right) return false;
  return left.getTime() > right.getTime();
}

/** Returns the earlier of two calendar days. */
export function minDay(a, b) {
  const left = toDateOnly(a);
  const right = toDateOnly(b);
  if (!left) return right;
  if (!right) return left;
  return left.getTime() <= right.getTime() ? left : right;
}

/** Clamp a day so it is never after maxDate. */
export function clampToMaxDay(date, maxDate) {
  const value = toDateOnly(date);
  const max = toDateOnly(maxDate);
  if (!value) return null;
  if (!max) return value;
  return isAfterDay(value, max) ? max : value;
}

/** Clamp a month (1st of month) so it is never after maxDate's month. */
export function clampToMaxMonth(date, maxDate) {
  const value = startOfMonth(date);
  const max = startOfMonth(maxDate);
  if (!value) return null;
  if (!max) return value;
  return isAfterDay(value, max) ? max : value;
}

export function isWithinInclusive(day, start, end) {
  const value = toDateOnly(day);
  const from = toDateOnly(start);
  const to = toDateOnly(end);
  if (!value || !from || !to) return false;
  const min = from.getTime() <= to.getTime() ? from : to;
  const max = from.getTime() <= to.getTime() ? to : from;
  const time = value.getTime();
  return time >= min.getTime() && time <= max.getTime();
}

export function startOfWeek(value) {
  const date = toDateOnly(value);
  if (!date) return null;
  const next = new Date(date);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

export function endOfWeek(value) {
  const date = startOfWeek(value);
  if (!date) return null;
  return addDays(date, 6);
}

export function getMonthMatrix(monthValue) {
  const monthStart = startOfMonth(monthValue);
  if (!monthStart) return [];

  const gridStart = startOfWeek(monthStart);
  const weeks = [];
  let cursor = gridStart;

  for (let week = 0; week < 6; week += 1) {
    const days = [];
    for (let day = 0; day < 7; day += 1) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }
    weeks.push(days);
  }

  return weeks;
}

export function getMonthLabel(value) {
  const date = toDateOnly(value);
  if (!date) return "";
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function getMonthOptions() {
  return MONTHS.map((label, index) => ({ value: index, label }));
}

export function getYearOptions(
  centerYear = new Date().getFullYear(),
  spanPast = 30,
  spanFuture = 5
) {
  const years = [];
  const start = Number(centerYear) - Number(spanPast);
  const end = Number(centerYear) + Number(spanFuture);
  for (let year = start; year <= end; year += 1) {
    years.push(year);
  }
  return years;
}

export const DATE_RANGE_PRESETS = [
  { id: "today", label: "Today", operators: ["on"] },
  { id: "yesterday", label: "Yesterday", operators: ["on"] },
  { id: "this_week", label: "This Week", operators: ["between"] },
  { id: "last_week", label: "Last Week", operators: ["between"] },
  { id: "this_month", label: "This Month", operators: ["between"] },
  { id: "last_month", label: "Last Month", operators: ["between"] },
  { id: "last_30", label: "Last 30 days", operators: ["between"] },
  { id: "last_60", label: "Last 60 days", operators: ["between"] },
  { id: "last_90", label: "Last 90 days", operators: ["between"] },
  { id: "last_365", label: "Last 365 days", operators: ["between"] }
];

export const DATE_OPERATOR_OPTIONS = [
  { value: "on", label: "On" },
  { value: "before", label: "Before" },
  { value: "after", label: "After" },
  { value: "between", label: "Between" }
];

export function getPresetsForOperator(operator) {
  const op = String(operator || "").trim().toLowerCase();
  return DATE_RANGE_PRESETS.filter(
    (preset) =>
      preset.id !== "custom" && (preset.operators || []).includes(op)
  );
}

export function formatDateFilterLabel({
  operator = "between",
  startDate = null,
  endDate = null,
  preset = null,
  preferDateRangeLabel = false
} = {}) {
  const op = String(operator || "between").toLowerCase();
  const presetMeta = DATE_RANGE_PRESETS.find((item) => item.id === preset);

  if (preferDateRangeLabel && op === "between" && startDate && endDate) {
    return formatRangeLabel(startDate, endDate);
  }

  if (preset && preset !== "custom" && presetMeta) {
    return presetMeta.label;
  }

  if (op === "between") {
    return formatRangeLabel(startDate, endDate);
  }

  const day = formatDisplayDate(startDate || endDate);
  if (!day) return "Select dates";
  if (op === "before") return `Before ${day}`;
  if (op === "after") return `After ${day}`;
  return day;
}

export function resolvePresetRange(presetId, { today = new Date(), onboardedAt = null } = {}) {
  if (presetId === "custom") return null;
  const now = toDateOnly(today) || toDateOnly(new Date());
  if (!now) return null;

  switch (presetId) {
    case "today":
      return { start: now, end: now };
    case "yesterday": {
      const day = addDays(now, -1);
      return { start: day, end: day };
    }
    case "this_week":
      return { start: startOfWeek(now), end: minDay(endOfWeek(now), now) };
    case "last_week": {
      const lastWeekAnchor = addDays(startOfWeek(now), -7);
      return { start: startOfWeek(lastWeekAnchor), end: endOfWeek(lastWeekAnchor) };
    }
    case "this_month":
      return { start: startOfMonth(now), end: now };
    case "last_month": {
      const prev = addMonths(now, -1);
      return { start: startOfMonth(prev), end: endOfMonth(prev) };
    }
    case "last_30":
      return { start: addDays(now, -29), end: now };
    case "last_60":
      return { start: addDays(now, -59), end: now };
    case "last_90":
      return { start: addDays(now, -89), end: now };
    case "last_365":
      return { start: addDays(now, -364), end: now };
    default:
      return null;
  }
}

export function detectPresetId(start, end, { today = new Date(), onboardedAt = null, operator = "between" } = {}) {
  if (!start) return null;
  const op = String(operator || "between").toLowerCase();
  const presets = getPresetsForOperator(op).filter((item) => item.id !== "custom");

  for (const preset of presets) {
    const range = resolvePresetRange(preset.id, { today, onboardedAt });
    if (!range) continue;
    if (op === "between") {
      if (end && isSameDay(range.start, start) && isSameDay(range.end, end)) {
        return preset.id;
      }
    } else if (isSameDay(range.start, start)) {
      return preset.id;
    }
  }
  return start || end ? "custom" : null;
}

export const FILTER_TYPE = {
  NUMERIC: "Numeric",
  CATEGORICAL: "Categorical",
  TEXT: "Text",
  DATE: "Date"
};

export const FILTER_OPERATORS = {
  [FILTER_TYPE.NUMERIC]: [
    { value: "eq", label: "Equals", symbol: "=" },
    { value: "neq", label: "Not Equals", symbol: "≠" },
    { value: "gt", label: "Greater Than", symbol: ">" },
    { value: "gte", label: "Greater Than Or Equal To", symbol: "≥" },
    { value: "lt", label: "Less Than", symbol: "<" },
    { value: "lte", label: "Less Than Or Equal To", symbol: "≤" },
    { value: "between", label: "Between", symbol: "between" }
  ],
  [FILTER_TYPE.CATEGORICAL]: [
    { value: "is", label: "is", symbol: "is" },
    { value: "is_not", label: "is not", symbol: "is not" },
    { value: "is_any_of", label: "is any of", symbol: "is any of" }
  ],
  [FILTER_TYPE.TEXT]: [
    { value: "contains", label: "contains", symbol: "contains" },
    { value: "does_not_contain", label: "does not contain", symbol: "does not contain" },
    { value: "equals", label: "equals", symbol: "equals" },
    { value: "starts_with", label: "starts with", symbol: "starts with" }
  ],
  [FILTER_TYPE.DATE]: [
    { value: "on", label: "On", symbol: "on" },
    { value: "before", label: "Before", symbol: "before" },
    { value: "after", label: "After", symbol: "after" },
    { value: "between", label: "Between", symbol: "between" }
  ]
};

const OPERATOR_META = {
  eq: { label: "Equals", symbol: "=" },
  equals: { label: "equals", symbol: "equals" },
  neq: { label: "Not Equals", symbol: "≠" },
  not_equals: { label: "Not Equals", symbol: "≠" },
  gt: { label: "Greater Than", symbol: ">" },
  gte: { label: "Greater Than Or Equal To", symbol: "≥" },
  lt: { label: "Less Than", symbol: "<" },
  lte: { label: "Less Than Or Equal To", symbol: "≤" },
  between: { label: "Between", symbol: "between" },
  is_between: { label: "is between", symbol: "between" },
  is: { label: "is", symbol: "is" },
  is_not: { label: "is not", symbol: "is not" },
  is_any_of: { label: "is any of", symbol: "is any of" },
  contains: { label: "contains", symbol: "contains" },
  does_not_contain: { label: "does not contain", symbol: "does not contain" },
  does_not_contain: { label: "does not contain", symbol: "does not contain" },
  starts_with: { label: "starts with", symbol: "starts with" },
  on: { label: "On", symbol: "on" },
  before: { label: "Before", symbol: "before" },
  after: { label: "After", symbol: "after" },
  on_or_after: { label: "On or after", symbol: "≥" },
  on_or_before: { label: "On or before", symbol: "≤" }
};

export function normalizeFilterType(type) {
  const raw = String(type || "").trim().toLowerCase();
  if (raw === "numeric" || raw === "number") return FILTER_TYPE.NUMERIC;
  if (raw === "categorical" || raw === "category" || raw === "enum") {
    return FILTER_TYPE.CATEGORICAL;
  }
  if (raw === "text" || raw === "string") return FILTER_TYPE.TEXT;
  if (raw === "date" || raw === "datetime") return FILTER_TYPE.DATE;
  return FILTER_TYPE.TEXT;
}

export function normalizeOperatorValue(operator) {
  const raw = String(operator || "").trim();
  if (!raw) return "";

  const key = raw.toLowerCase().replace(WHITESPACE_COLLAPSE_REGEX, "_");
  const aliases = {
    "=": "eq",
    "==": "eq",
    "!=": "neq",
    "≠": "neq",
    ">": "gt",
    ">=": "gte",
    "≥": "gte",
    "<": "lt",
    "<=": "lte",
    "≤": "lte",
    greater_than: "gt",
    greater_than_or_equal_to: "gte",
    less_than: "lt",
    less_than_or_equal_to: "lte",
    not_equals: "neq",
    does_not_contain: "does_not_contain",
    on_or_after: "gte",
    on_or_before: "lte",
    is_between: "between",
    between: "between",
    on: "on",
    before: "before",
    after: "after"
  };

  return aliases[key] || aliases[raw] || key;
}

export function isBetweenOperator(operator) {
  return normalizeOperatorValue(operator) === "between";
}

export function resolveOperatorMeta(operatorValue) {
  const value = normalizeOperatorValue(operatorValue);
  const meta = OPERATOR_META[value];
  if (meta) {
    return { value, label: meta.label, symbol: meta.symbol };
  }

  const label = String(operatorValue || value)
    .replace(UNDERSCORE_REGEX, " ")
    .trim();
  return { value, label: label || value, symbol: label || value };
}

export function normalizeOperators(list, type) {
  if (Array.isArray(list) && list.length > 0) {
    const seen = new Set();
    const operators = [];
    for (const item of list) {
      const raw =
        typeof item === "string" || typeof item === "number"
          ? item
          : item?.value ?? item?.operator ?? item?.name ?? "";
      const meta = resolveOperatorMeta(raw);
      if (!meta.value || seen.has(meta.value)) continue;
      seen.add(meta.value);
      operators.push(meta);
    }
    if (operators.length) return operators;
  }

  return getOperatorsForType(type);
}

export function normalizeFilterFields(list) {
  if (!Array.isArray(list)) return [];

  const seen = new Set();
  const fields = [];

  for (const item of list) {
    const fieldName = String(
      item?.field_name ?? item?.fieldName ?? item?.key ?? item?.name ?? ""
    ).trim();
    const displayName = String(
      item?.display_name ??
      item?.displayName ??
      item?.field ??
      item?.label ??
      fieldName
    ).trim();

    if (!displayName && !fieldName) continue;

    const dedupeKey = (fieldName || displayName).toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const type = normalizeFilterType(
      item?.field_type ?? item?.fieldType ?? item?.type
    );
    const options = Array.isArray(item?.options)
      ? [...new Set(item.options.map((opt) => String(opt ?? "").trim()).filter(Boolean))]
      : [];
    const operators = normalizeOperators(item?.operators, type);

    fields.push({
      id: item?.id ?? null,
      field: displayName || fieldName,
      fieldName: fieldName || displayName,
      displayName: displayName || fieldName,
      type,
      options,
      operators
    });
  }

  return fields;
}

export function getOperatorsForType(type) {
  const normalized = normalizeFilterType(type);
  return FILTER_OPERATORS[normalized] || FILTER_OPERATORS[FILTER_TYPE.TEXT];
}

export function getOperatorsForField(filterField) {
  if (Array.isArray(filterField?.operators) && filterField.operators.length) {
    return filterField.operators;
  }
  return getOperatorsForType(filterField?.type);
}

export function getDefaultOperator(filterFieldOrType) {
  if (filterFieldOrType && typeof filterFieldOrType === "object") {
    return getOperatorsForField(filterFieldOrType)[0]?.value || "eq";
  }
  return getOperatorsForType(filterFieldOrType)[0]?.value || "eq";
}

export function findOperator(filterFieldOrType, operatorValue) {
  const operators =
    filterFieldOrType && typeof filterFieldOrType === "object"
      ? getOperatorsForField(filterFieldOrType)
      : getOperatorsForType(filterFieldOrType);

  const normalized = normalizeOperatorValue(operatorValue);
  return (
    operators.find((item) => item.value === normalized) ||
    resolveOperatorMeta(operatorValue) ||
    operators[0] ||
    null
  );
}

export function createEmptyDraft(filterField = null) {
  if (!filterField) {
    return {
      id: null,
      field: "",
      fieldName: "",
      displayName: "",
      type: "",
      options: [],
      operators: [],
      operator: "",
      value: "",
      valueTo: "",
      values: []
    };
  }

  const operators = getOperatorsForField(filterField);

  return {
    id: filterField.id ?? null,
    field: filterField.displayName || filterField.field,
    fieldName: filterField.fieldName || filterField.field,
    displayName: filterField.displayName || filterField.field,
    type: filterField.type,
    options: Array.isArray(filterField.options) ? [...filterField.options] : [],
    operators,
    operator: operators[0]?.value || "",
    value: "",
    valueTo: "",
    values: []
  };
}

export function formatFilterChipLabel(filter) {
  const label = filter?.displayName || filter?.field || filter?.fieldName || "";
  if (!label) return "";

  const operator = findOperator(
    { type: filter.type, operators: filter.operators },
    filter.operator
  );
  const symbol = operator?.symbol || filter.operator || "";

  if (isBetweenOperator(filter.operator)) {
    const from = filter.value ?? "";
    const to = filter.valueTo ?? "";
    return `${label} ${from} – ${to}`.trim();
  }

  if (filter.operator === "is_any_of") {
    const list = Array.isArray(filter.values)
      ? filter.values
      : String(filter.value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    return `${label} ${symbol} ${list.join(", ")}`.trim();
  }

  return `${label} ${symbol} ${filter.value ?? ""}`.trim();
}

export function isDraftComplete(draft) {
  if (!draft?.field || !draft?.operator) return false;

  if (isBetweenOperator(draft.operator)) {
    return String(draft.value ?? "").trim() !== "" && String(draft.valueTo ?? "").trim() !== "";
  }

  if (draft.operator === "is_any_of") {
    return Array.isArray(draft.values) && draft.values.length > 0;
  }

  return String(draft.value ?? "").trim() !== "";
}

export function draftToAppliedFilter(draft) {
  if (!isDraftComplete(draft)) return null;

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const base = {
    id,
    fieldId: draft.id ?? null,
    field: draft.displayName || draft.field,
    fieldName: draft.fieldName || draft.field,
    displayName: draft.displayName || draft.field,
    type: draft.type,
    operators: Array.isArray(draft.operators) ? draft.operators : [],
    operator: draft.operator
  };

  if (isBetweenOperator(draft.operator)) {
    return {
      ...base,
      operator: "between",
      value: String(draft.value).trim(),
      valueTo: String(draft.valueTo).trim()
    };
  }

  if (draft.operator === "is_any_of") {
    return {
      ...base,
      values: [...draft.values],
      value: draft.values.join(", ")
    };
  }

  return {
    ...base,
    value: String(draft.value).trim()
  };
}

export function matchFilterFieldToColumn(filterField, column) {
  if (!filterField || !column) return false;

  const fieldName = String(filterField.fieldName || filterField.field || "")
    .trim()
    .toLowerCase();
  const displayName = String(filterField.displayName || filterField.field || "")
    .trim()
    .toLowerCase();
  const key = String(column.key || "").trim().toLowerCase();
  const sortKey = String(column.sortKey || "").trim().toLowerCase();
  const label = String(column.label || "").trim().toLowerCase();

  if (!fieldName && !displayName) return false;

  if (fieldName && (fieldName === key || fieldName === sortKey)) return true;
  if (displayName && displayName === label) return true;

  if (fieldName && key.endsWith(`_${fieldName}`)) return true;
  if (fieldName && key.replace(UNDERSCORE_REGEX, " ") === displayName) return true;
  if (displayName && key.replace(UNDERSCORE_REGEX, " ") === displayName) return true;

  return false;
}

export function getSelectableFilterFields(
  filterFields = [],
  visibleColumns = [],
  allColumns = []
) {
  if (!Array.isArray(filterFields) || !filterFields.length) return [];

  const columns = Array.isArray(allColumns) && allColumns.length
    ? allColumns
    : visibleColumns;
  const visibleKeys = new Set(
    (Array.isArray(visibleColumns) ? visibleColumns : [])
      .map((column) => column?.key)
      .filter(Boolean)
  );

  return filterFields.filter((filterField) => {
    const matched = columns.find((column) =>
      matchFilterFieldToColumn(filterField, column)
    );
    if (!matched) return true;
    return visibleKeys.has(matched.key);
  });
}

export function toApiOperator(operator) {
  const normalized = normalizeOperatorValue(operator);
  const map = {
    eq: "=",
    equals: "equals",
    neq: "!=",
    gt: ">",
    gte: ">=",
    lt: "<",
    lte: "<=",
    between: "between",
    is: "is",
    is_not: "is_not",
    is_any_of: "is_any_of",
    contains: "contains",
    does_not_contain: "does_not_contain",
    starts_with: "starts_with",
    on: "on",
    before: "before",
    after: "after"
  };

  if (map[normalized]) return map[normalized];

  const raw = String(operator || "").trim();
  return raw || normalized;
}

export function isDateFilterField(filterField) {
  return normalizeFilterType(filterField?.type) === FILTER_TYPE.DATE;
}

export function getDateFilterField(filterFields = []) {
  if (!Array.isArray(filterFields)) return null;
  return filterFields.find((item) => isDateFilterField(item)) || null;
}

export function excludeDateFilterFields(filterFields = []) {
  if (!Array.isArray(filterFields)) return [];
  return filterFields.filter((item) => !isDateFilterField(item));
}

export function serializeDateRangeFilter(dateRange, dateField) {
  const field = String(
    dateField?.fieldName || dateField?.field || dateRange?.field || ""
  ).trim();
  if (!field || !dateRange) return null;

  const operator = normalizeOperatorValue(dateRange.operator || "between");
  if (!operator) return null;

  if (operator === "between") {
    const start = String(dateRange.startDate || "").trim();
    const end = String(dateRange.endDate || "").trim();
    if (!start || !end) return null;
    return {
      field,
      operator: "between",
      value: [start, end]
    };
  }

  if (operator === "on" || operator === "before" || operator === "after") {
    const value = String(
      dateRange.startDate || dateRange.endDate || dateRange.value || ""
    ).trim();
    if (!value) return null;
    return { field, operator, value };
  }

  return null;
}

function toApiFilterValue(filter, apiOperator) {
  const op = normalizeOperatorValue(apiOperator || filter.operator);

  if (op === "between" || isBetweenOperator(op)) {
    return [filter.value, filter.valueTo ?? filter.value_to].map((item) =>
      item == null ? "" : String(item).trim()
    );
  }

  if (op === "is" || op === "is_not" || op === "is_any_of") {
    if (Array.isArray(filter.values) && filter.values.length) {
      return filter.values.map((item) => String(item));
    }
    if (Array.isArray(filter.value)) {
      return filter.value.map((item) => String(item));
    }
    const single = String(filter.value ?? "").trim();
    return single ? [single] : [];
  }

  if (normalizeFilterType(filter.type) === FILTER_TYPE.NUMERIC) {
    const num = Number(filter.value);
    return Number.isFinite(num) ? num : filter.value;
  }

  return filter.value;
}

export function serializeAppliedFilters(filters = []) {
  return filters
    .map((filter) => {
      const field = String(filter.fieldName || filter.field || "").trim();
      if (!field) return null;

      const operator = toApiOperator(filter.operator);
      if (!operator) return null;

      const value = toApiFilterValue(filter, operator);

      if (isBetweenOperator(operator)) {
        if (!Array.isArray(value) || !value[0] || !value[1]) return null;
      } else if (Array.isArray(value)) {
        if (!value.length) return null;
      } else if (value == null || value === "") {
        return null;
      }

      return {
        field,
        operator,
        value
      };
    })
    .filter(Boolean);
}

function flattenReactText(node) {
  if (node == null || node === false || node === true) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenReactText).join("");
  if (typeof node === "object" && node.props?.children != null) {
    return flattenReactText(node.props.children);
  }
  return "";
}

export function getExportCellValue(column, row) {
  const raw = column.accessor ? column.accessor(row) : row?.[column.key];

  if (typeof column.exportValue === "function") {
    const exported = column.exportValue(raw, row);
    return exported == null ? "" : String(exported);
  }

  if (typeof column.render === "function") {
    const rendered = column.render(raw, row);
    if (rendered == null) return "";
    if (typeof rendered === "string" || typeof rendered === "number") {
      return String(rendered);
    }
    const text = flattenReactText(rendered).trim();
    if (text) return text;
  }

  if (raw == null || raw === "") return "";
  return String(raw);
}

export function buildExportRows(columns, rows) {
  const exportColumns = columns.filter((column) => column.exportable !== false);
  const headers = exportColumns.map(
    (column) => column.exportLabel || column.label || column.key
  );
  const dataRows = rows.map((row) =>
    exportColumns.map((column) => getExportCellValue(column, row))
  );
  return [headers, ...dataRows];
}

function slugifyFilename(name) {
  return String(name || "report")
    .trim()
    .toLowerCase()
    .replace(SLUG_NON_ALNUM_REGEX, "-")
    .replace(SLUG_EDGE_DASH_REGEX, "") || "report";
}

export function downloadExcelWorkbook(sheetData, { sheetName = "Report", fileName = "report" } = {}) {
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31) || "Report");

  const stamp = new Date().toISOString().slice(0, 10);
  const safeName = `${slugifyFilename(fileName)}_${stamp}.xlsx`;
  XLSX.writeFile(workbook, safeName);
}