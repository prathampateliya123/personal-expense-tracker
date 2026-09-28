export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const flattenErrorValue = (value) => {
  if (value == null) return null;
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "object") {
    if (typeof value.message === "string" && value.message.trim()) {
      return value.message.trim();
    }
    const nested = Object.values(value)
      .map((item) => flattenErrorValue(item))
      .filter(Boolean);
    return nested.length ? nested.join(", ") : null;
  }
  return String(value);
};

export const getApiErrorMessage = (error, fallback = "Something went wrong") => {
  const data = error?.response?.data;
  const apiMessage = flattenErrorValue(
    data?.message || data?.detail || data?.error || data?.errors
  );

  if (apiMessage) return apiMessage;

  const localMessage = flattenErrorValue(error?.message);
  if (localMessage) return localMessage;

  return fallback;
};

export const debounce = (fn, delay = 400) => {
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
};
