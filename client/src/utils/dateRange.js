/**
 * utils/dateRange.js
 * Date range picker helpers — ported from reference report utils.
 */

export const ISO_DATE_PARTS_REGEX = /^(\d{4})-(\d{2})-(\d{2})/;

const UNDERSCORE_REGEX = /_/g;

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
  "December",
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
  "Dec",
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

export function minDay(a, b) {
  const left = toDateOnly(a);
  const right = toDateOnly(b);
  if (!left) return right;
  if (!right) return left;
  return left.getTime() <= right.getTime() ? left : right;
}

export function clampToMaxDay(date, maxDate) {
  const value = toDateOnly(date);
  const max = toDateOnly(maxDate);
  if (!value) return null;
  if (!max) return value;
  return isAfterDay(value, max) ? max : value;
}

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

export function getMonthOptions() {
  return MONTHS.map((label, index) => ({ value: index, label }));
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
  { id: "last_365", label: "Last 365 days", operators: ["between"] },
];

export const DATE_OPERATOR_OPTIONS = [
  { value: "on", label: "On" },
  { value: "before", label: "Before" },
  { value: "after", label: "After" },
  { value: "between", label: "Between" },
];

export function getPresetsForOperator(operator) {
  const op = String(operator || "").trim().toLowerCase();
  return DATE_RANGE_PRESETS.filter(
    (preset) => preset.id !== "custom" && (preset.operators || []).includes(op)
  );
}

export function formatDateFilterLabel({
  operator = "between",
  startDate = null,
  endDate = null,
  preset = null,
  preferDateRangeLabel = false,
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

export function resolvePresetRange(presetId, { today = new Date() } = {}) {
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

export function detectPresetId(
  start,
  end,
  { today = new Date(), operator = "between" } = {}
) {
  if (!start) return null;
  const op = String(operator || "between").toLowerCase();
  const presets = getPresetsForOperator(op).filter((item) => item.id !== "custom");

  for (const preset of presets) {
    const range = resolvePresetRange(preset.id, { today });
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

export function normalizeOperatorLabel(value) {
  return String(value || "").replace(UNDERSCORE_REGEX, " ");
}
