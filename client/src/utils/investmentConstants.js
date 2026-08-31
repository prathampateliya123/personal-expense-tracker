/**
 * utils/investmentConstants.js
 * Shared investment type and frequency labels for forms and UI.
 */

export const INVESTMENT_TYPES = [
  { value: "SIP", label: "SIP" },
  { value: "mutual_fund", label: "Mutual Fund" },
  { value: "FD", label: "Fixed Deposit (FD)" },
  { value: "RD", label: "Recurring Deposit (RD)" },
  { value: "stocks", label: "Stocks" },
  { value: "other", label: "Other" },
];

export const INVESTMENT_FREQUENCIES = [
  { value: "one-time", label: "One-time" },
  { value: "monthly", label: "Monthly" },
];

export const TYPE_LABELS = Object.fromEntries(
  INVESTMENT_TYPES.map(({ value, label }) => [value, label])
);
