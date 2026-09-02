/**
 * utils/helper.js
 * Shared pure helpers — formatters, debounce, API error parsing.
 */

export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const formatHeaderDate = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const dash = (value) => (value == null || value === "" ? "—" : value);

export const getApiErrorMessage = (error, fallback = "Something went wrong") => {
  const data = error?.response?.data;
  const apiMessage = data?.message || data?.detail || data?.error;

  if (typeof apiMessage === "string" && apiMessage.trim()) {
    return apiMessage;
  }

  if (error?.message && typeof error.message === "string") {
    return error.message;
  }

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

export const getNameFromEmail = (email = "") => {
  const value = String(email).trim();
  if (!value.includes("@")) return value;
  return value.split("@")[0] || "";
};
