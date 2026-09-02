import Cookies from "universal-cookie";
import {
  COOKIE_OPTIONS,
  CREATE_RULE_WIZARD_COOKIE,
  DASHBOARD_PREFS_COOKIE,
  REPORT_COLUMNS_COOKIE,
  REPORT_DATE_RANGE_COOKIE,
  REPORT_FILTERS_COOKIE,
  REPORT_PREFS_COOKIE,
  STORE_ID_NAME,
  TOKEN_NAME
} from "./constants";
import { removeLocalStorage } from "./localstorage";

export {
  AUTH_COOKIE_KEY,
  AUTH_PROVIDER_NAME,
  COOKIE_OPTIONS,
  CREATE_RULE_WIZARD_COOKIE,
  DASHBOARD_PREFS_COOKIE,
  REFRESH_TOKEN_NAME,
  REPORT_COLUMNS_COOKIE,
  REPORT_DATE_RANGE_COOKIE,
  REPORT_FILTERS_COOKIE,
  REPORT_PREFS_COOKIE,
  STORE_ID_NAME,
  TOKEN_NAME,
  USER_ID_NAME
} from "./constants";

const cookies = new Cookies();

function normalizeCookieOptions(options = COOKIE_OPTIONS) {
  const opts = { ...options };
  const domain = typeof opts.domain === "string" ? opts.domain.trim() : "";
  if (
    !domain ||
    domain.includes("://") ||
    domain.includes("/") ||
    domain.includes(":")
  ) {
    delete opts.domain;
  } else {
    opts.domain = domain;
  }
  if (!opts.maxAge && opts.expires instanceof Date) {
    const ms = opts.expires.getTime() - Date.now();
    if (ms > 0) opts.maxAge = Math.floor(ms / 1000);
  }
  delete opts.expires;
  return opts;
}

const SAFE_COOKIE_OPTIONS = normalizeCookieOptions(COOKIE_OPTIONS);

export const setCookie = (key, value) => {
  const normalized = typeof value === "string" ? value.trim() : String(value ?? "").trim();
  cookies.set(key, normalized, SAFE_COOKIE_OPTIONS);
};

export const setRawCookie = (key, value) => {
  cookies.set(key, String(value ?? ""), SAFE_COOKIE_OPTIONS);
};

export const getCookie = (key) => {
  const value = cookies.get(key);
  if (value == null || value === "") return "";
  if (typeof value === "object") return "";
  return String(value).trim();
};

export const getRawCookie = (key) => {
  const value = cookies.get(key);
  if (value == null) return "";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return String(value);
};

function clearCreateRuleWizardStorage() {
  removeChunkedCookie(CREATE_RULE_WIZARD_COOKIE);
  removeLocalStorage(CREATE_RULE_WIZARD_COOKIE);
}

export const removeCookie = (key) => {
  cookies.remove(key, SAFE_COOKIE_OPTIONS);
  cookies.remove(key, { path: "/" });
  if (key === TOKEN_NAME) {
    clearCreateRuleWizardStorage();
  }
};

export const clearCookie = () => {
  const allCookies = cookies.getAll();
  for (const key in allCookies) {
    if (
      key === STORE_ID_NAME ||
      key === REPORT_PREFS_COOKIE ||
      key === DASHBOARD_PREFS_COOKIE ||
      key === REPORT_COLUMNS_COOKIE ||
      key === REPORT_FILTERS_COOKIE ||
      key === REPORT_DATE_RANGE_COOKIE
    ) {
      continue;
    }
    removeCookie(key);
  }
  clearCreateRuleWizardStorage();
};

export const readCookieObject = (cookieName) => {
  const value = cookies.get(cookieName);

  if (value == null || value === "") return {};

  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") return {};

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
};

export const writeCookieObject = (cookieName, prefs) => {
  if (!prefs || typeof prefs !== "object" || Array.isArray(prefs) || !Object.keys(prefs).length) {
    removeCookie(cookieName);
    return;
  }
  cookies.set(cookieName, prefs, SAFE_COOKIE_OPTIONS);
};

const COOKIE_CHUNK_SIZE = 1200;
const CHUNK_META_KEY = "__chunks";
const CHUNK_VERSION_KEY = "__v";
const CHUNK_VERSION = 2;

function chunkCookieName(baseName, index) {
  return `${baseName}.${index}`;
}

export const removeChunkedCookie = (baseName) => {
  if (!baseName) return;

  const metaRaw = getRawCookie(baseName);
  let parts = 0;
  if (metaRaw) {
    try {
      const meta = JSON.parse(metaRaw);
      if (meta && Number.isFinite(Number(meta[CHUNK_META_KEY]))) {
        parts = Number(meta[CHUNK_META_KEY]);
      }
    } catch {
      // ignore
    }
  }

  removeCookie(baseName);
  for (let i = 0; i < Math.max(parts, 60); i += 1) {
    removeCookie(chunkCookieName(baseName, i));
  }
};

export const writeChunkedCookieObject = (baseName, prefs) => {
  if (!prefs || typeof prefs !== "object" || Array.isArray(prefs) || !Object.keys(prefs).length) {
    removeChunkedCookie(baseName);
    return false;
  }

  let encoded = "";
  try {
    encoded = encodeURIComponent(JSON.stringify(prefs));
  } catch {
    removeChunkedCookie(baseName);
    return false;
  }

  removeChunkedCookie(baseName);

  try {
    if (encoded.length <= COOKIE_CHUNK_SIZE) {
      setRawCookie(baseName, encoded);
      const roundTrip = getRawCookie(baseName);
      return Boolean(roundTrip);
    }

    const parts = Math.ceil(encoded.length / COOKIE_CHUNK_SIZE);
    setRawCookie(
      baseName,
      JSON.stringify({
        [CHUNK_META_KEY]: parts,
        [CHUNK_VERSION_KEY]: CHUNK_VERSION
      })
    );

    for (let i = 0; i < parts; i += 1) {
      const slice = encoded.slice(i * COOKIE_CHUNK_SIZE, (i + 1) * COOKIE_CHUNK_SIZE);
      setRawCookie(chunkCookieName(baseName, i), slice);
    }

    const meta = getRawCookie(baseName);
    const first = getRawCookie(chunkCookieName(baseName, 0));
    return Boolean(meta && first);
  } catch {
    removeChunkedCookie(baseName);
    return false;
  }
};

export const readChunkedCookieObject = (baseName) => {
  if (!baseName) return {};

  const decodePayload = (encoded) => {
    if (!encoded) return {};
    try {
      let text = encoded;
      try {
        text = decodeURIComponent(encoded);
      } catch {
        text = encoded;
      }
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      return parsed;
    } catch {
      return {};
    }
  };

  const direct = cookies.get(baseName);
  if (direct && typeof direct === "object" && !Array.isArray(direct)) {
    if (Number.isFinite(Number(direct[CHUNK_META_KEY]))) {
      const parts = Number(direct[CHUNK_META_KEY]);
      let encoded = "";
      for (let i = 0; i < parts; i += 1) {
        encoded += getRawCookie(chunkCookieName(baseName, i));
      }
      return decodePayload(encoded);
    }
    return direct;
  }

  const raw = getRawCookie(baseName);
  if (!raw) return {};

  try {
    const maybeMeta = JSON.parse(raw);
    if (
      maybeMeta &&
      typeof maybeMeta === "object" &&
      Number.isFinite(Number(maybeMeta[CHUNK_META_KEY]))
    ) {
      const parts = Number(maybeMeta[CHUNK_META_KEY]);
      let encoded = "";
      for (let i = 0; i < parts; i += 1) {
        const piece = getRawCookie(chunkCookieName(baseName, i));
        if (!piece) return {};
        encoded += piece;
      }
      return decodePayload(encoded);
    }
  } catch {
  }

  return decodePayload(raw);
};