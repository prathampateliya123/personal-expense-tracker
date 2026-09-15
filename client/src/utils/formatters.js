export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatExpenseDate = formatDate;
export const formatExpenseTime = formatTime;

export const toDateInputValue = (date, { fallbackToday = false } = {}) => {
  if (!date) {
    return fallbackToday ? new Date().toISOString().split("T")[0] : "";
  }
  return new Date(date).toISOString().split("T")[0];
};
