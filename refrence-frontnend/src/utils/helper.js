import axios from "axios";
import {
  ASIN_TARGET_REGEX,
  BEARER_PREFIX_REGEX,
  IP_ADDRESS_API_URL,
  ISO_DATE_PREFIX_REGEX,
  MOBILE_USER_AGENT_REGEX,
  MONTHS_SHORT,
  QUOTE_TRIM_REGEX,
  TOKEN_NAME
} from "./constants";
import { getCookie } from "./cookie";
import { normalizeFilterFields } from "./report";

const cleanEnvValue = (value) => {
  if (typeof value !== "string") return "";
  return value.trim().replace(QUOTE_TRIM_REGEX, "");
};

export function debounce(fn, delay = 400) {
  let timerId;

  const debounced = (...args) => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };

  debounced.cancel = () => {
    window.clearTimeout(timerId);
  };

  return debounced;
}

export const authHeaders = (token = "") => {
  const authToken = String(token || "")
    .trim()
    .replace(BEARER_PREFIX_REGEX, "")
    .trim();
  return authToken ? { Authorization: `Bearer ${authToken}` } : undefined;
};

export const getApiHeaders = (token = "") => {
  const authToken = String(token || getCookie(TOKEN_NAME) || "")
    .trim()
    .replace(BEARER_PREFIX_REGEX, "")
    .trim();
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
};

export const getNameFromEmail = (email = "") => {
  const value = String(email).trim();
  if (!value.includes("@")) return value;
  return value.split("@")[0] || "";
};

export const fetchUserIP = async () => {
  const ipApiUrl = cleanEnvValue(IP_ADDRESS_API_URL);

  if (!ipApiUrl) {
    return "";
  }

  try {
    const response = await axios.get(ipApiUrl);
    if (typeof response?.data === "string") return response.data.trim();
    if (response?.data?.ip) return String(response.data.ip).trim();
    if (response?.data?.query) return String(response.data.query).trim();
    return "";
  } catch {
    return "";
  }
};

export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;

  return {
    browser: userAgent.includes("Chrome")
      ? "Chrome"
      : userAgent.includes("Firefox")
        ? "Firefox"
        : userAgent.includes("Safari")
          ? "Safari"
          : "Unknown",
    os: userAgent.includes("Windows")
      ? "Windows"
      : userAgent.includes("Mac")
        ? "MacOS"
        : userAgent.includes("Linux")
          ? "Linux"
          : userAgent.includes("Android")
            ? "Android"
            : userAgent.includes("iPhone")
              ? "iOS"
              : "Unknown",
    device: MOBILE_USER_AGENT_REGEX.test(userAgent) ? "Mobile" : "Desktop"
  };
};

export const getPlatformType = () =>
  MOBILE_USER_AGENT_REGEX.test(navigator.userAgent) ? "mobile" : "web";

export const dash = (value) => (value == null || value === "" ? "—" : value);

export const formatDateTime = (value) => {
  if (value == null || value === "") return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const day = date.getDate();
  const month = MONTHS_SHORT[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};

export const formatReportNumber = (value, digits = 2) => {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(num) ? 0 : Math.min(digits, 2),
    maximumFractionDigits: digits
  });
};

export const formatReportDate = (value) => {
  if (!value) return "—";
  const raw = String(value).trim();
  const dateOnly = raw.match(ISO_DATE_PREFIX_REGEX)?.[1];
  if (dateOnly) {
    const [year, month, day] = dateOnly.split("-");
    const monthName = MONTHS_SHORT[Number(month) - 1] || month;
    return `${Number(day)} ${monthName} ${year}`;
  }
  return formatDateTime(value);
};

export const formatPercent = (value) => {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return `${formatReportNumber(num, 2)}%`;
};

export const parseAsinTarget = (value) => {
  if (value == null || value === "") return "";
  const match = String(value).trim().match(ASIN_TARGET_REGEX);
  return match?.[1] || "";
};

export const normalizeReportListResponse = (payload) => {
  const root = payload?.data ?? payload ?? {};
  const nested =
    root?.data && !Array.isArray(root.data) && typeof root.data === "object"
      ? root.data
      : root;

  // Prefer explicit rows when already normalized (e.g. dashboard list)
  let rows = [];
  if (Array.isArray(payload?.rows)) {
    rows = payload.rows;
  } else if (
    Array.isArray(nested?.data) &&
    (nested?.totalRecords != null ||
      nested?.total_records != null ||
      nested?.totalPages != null ||
      nested?.total_pages != null ||
      nested?.mode != null)
  ) {
    rows = nested.data;
  } else if (Array.isArray(nested?.rows)) {
    rows = nested.rows;
  } else if (Array.isArray(nested?.data)) {
    rows = nested.data;
  } else if (Array.isArray(root?.data)) {
    rows = root.data;
  } else if (Array.isArray(nested)) {
    rows = nested;
  } else if (Array.isArray(root)) {
    rows = root;
  }

  const filterFields = normalizeFilterFields(
    payload?.filterFields ??
      payload?.filter_name ??
      nested?.filterFields ??
      nested?.filter_name ??
      root?.filterFields ??
      root?.filter_name ??
      payload?.data?.filter_name
  );

  const summaryRaw =
    nested?.summary ??
    root?.summary ??
    payload?.summary ??
    payload?.data?.summary ??
    null;

  const summary =
    summaryRaw && typeof summaryRaw === "object" && !Array.isArray(summaryRaw)
      ? summaryRaw
      : null;

  return {
    rows,
    filterFields,
    summary,
    totalRecords:
      Number(
        payload?.totalRecords ??
          payload?.total_records ??
          nested?.totalRecords ??
          nested?.total_records ??
          root?.totalRecords ??
          root?.total_records ??
          rows.length
      ) || 0,
    totalPages:
      Number(
        payload?.totalPages ??
          payload?.total_pages ??
          nested?.totalPages ??
          nested?.total_pages ??
          root?.totalPages ??
          root?.total_pages ??
          1
      ) || 1,
    page: Number(payload?.page ?? nested?.page ?? root?.page ?? 1) || 1
  };
};