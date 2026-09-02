/**
 * utils/expenseConstants.js
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
  Food: "bg-amber-50 text-amber-700",
  Travel: "bg-sky-50 text-sky-700",
  Shopping: "bg-violet-50 text-violet-700",
  Bills: "bg-rose-50 text-rose-700",
  Entertainment: "bg-pink-50 text-pink-700",
  Health: "bg-emerald-50 text-emerald-700",
  Education: "bg-indigo-50 text-indigo-700",
  Rent: "bg-orange-50 text-orange-700",
  Other: "bg-surfaceGray text-textSecondary",
};

export const CATEGORY_AVATAR_BG = {
  Food: "bg-amber-100 text-amber-700",
  Travel: "bg-sky-100 text-sky-700",
  Shopping: "bg-violet-100 text-violet-700",
  Bills: "bg-rose-100 text-rose-700",
  Entertainment: "bg-pink-100 text-pink-700",
  Health: "bg-emerald-100 text-emerald-700",
  Education: "bg-indigo-100 text-indigo-700",
  Rent: "bg-orange-100 text-orange-700",
  Other: "bg-surfaceGray text-textSecondary",
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

export const formatExpenseTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
