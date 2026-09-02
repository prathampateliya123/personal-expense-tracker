/**
 * config/expenseConstants.js
 * Shared expense categories, payment modes, and UI helpers.
 */

export const EXPENSE_CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Rent",
  "Other",
];

export const PAYMENT_MODES = ["Cash", "UPI", "Card", "Bank Transfer"];

export const CATEGORY_COLORS = {
  Food: "bg-amber-100 text-amber-800",
  Travel: "bg-sky-100 text-sky-800",
  Shopping: "bg-violet-100 text-violet-800",
  Bills: "bg-rose-100 text-rose-800",
  Entertainment: "bg-pink-100 text-pink-800",
  Health: "bg-emerald-100 text-emerald-800",
  Education: "bg-indigo-100 text-indigo-800",
  Rent: "bg-orange-100 text-orange-800",
  Other: "bg-ink-100 text-ink-700",
};

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
