/**
 * utils/wealthConstants.js
 * Labels and helpers for savings & investments.
 */

export const INVESTMENT_TYPE_OPTIONS = [
  { value: "mutual_fund", label: "Mutual fund" },
  { value: "stocks", label: "Stocks" },
  { value: "fd", label: "Fixed deposit" },
  { value: "rd", label: "Recurring deposit" },
  { value: "ppf", label: "PPF" },
  { value: "nps", label: "NPS" },
  { value: "gold", label: "Gold" },
  { value: "crypto", label: "Crypto" },
  { value: "bonds", label: "Bonds" },
  { value: "other", label: "Other" },
];

export const SAVING_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

export const getInvestmentTypeLabel = (type) =>
  INVESTMENT_TYPE_OPTIONS.find((opt) => opt.value === type)?.label || type;

export const getSavingStatusLabel = (status) =>
  SAVING_STATUS_OPTIONS.find((opt) => opt.value === status)?.label || status;

export const toDateInputValue = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};
