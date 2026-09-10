/**
 * utils/expenseConstants.js
 * Shared payment modes and formatting helpers.
 */

export const PAYMENT_MODES = ["Cash", "UPI", "Card", "Bank Transfer"];

export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

export const formatExpenseDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const formatExpenseTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
