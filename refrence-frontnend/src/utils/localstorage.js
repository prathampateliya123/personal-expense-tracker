const canUseStorage = (store) => {
  try {
    return typeof window !== "undefined" && Boolean(store);
  } catch {
    return false;
  }
};

const normalizeString = (value) => {
  if (value == null) return "";
  return typeof value === "string" ? value.trim() : String(value).trim();
};

function createStorageHelpers(getStore) {
  const setItem = (key, value) => {
    try {
      const store = getStore();
      if (!canUseStorage(store) || !key) return;
      store.setItem(String(key), normalizeString(value));
    } catch {
      return;
    }
  };

  const getItem = (key) => {
    try {
      const store = getStore();
      if (!canUseStorage(store) || !key) return "";
      const value = store.getItem(String(key));
      if (value == null || value === "") return "";
      return String(value).trim();
    } catch {
      return "";
    }
  };

  const removeItem = (key) => {
    try {
      const store = getStore();
      if (!canUseStorage(store) || !key) return;
      store.removeItem(String(key));
    } catch {
      return;
    }
  };

  const clear = () => {
    try {
      const store = getStore();
      if (!canUseStorage(store)) return;
      store.clear();
    } catch {
      return;
    }
  };

  const setJson = (key, value) => {
    try {
      const store = getStore();
      if (!canUseStorage(store) || !key) return;
      store.setItem(String(key), JSON.stringify(value ?? null));
    } catch {
      return;
    }
  };

  const getJson = (key) => {
    try {
      const store = getStore();
      if (!canUseStorage(store) || !key) return null;
      const raw = store.getItem(String(key));
      if (raw == null || raw === "") return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  return { setItem, getItem, removeItem, clear, setJson, getJson };
}

const local = createStorageHelpers(() =>
  typeof window !== "undefined" ? window.localStorage : null
);
const session = createStorageHelpers(() =>
  typeof window !== "undefined" ? window.sessionStorage : null
);

export const setLocalStorage = local.setItem;
export const getLocalStorage = local.getItem;
export const removeLocalStorage = local.removeItem;
export const clearLocalStorage = local.clear;
export const setLocalJson = local.setJson;
export const getLocalJson = local.getJson;

export const setSessionStorage = session.setItem;
export const getSessionStorage = session.getItem;
export const removeSessionStorage = session.removeItem;
export const clearSessionStorage = session.clear;
export const setSessionJson = session.setJson;
export const getSessionJson = session.getJson;