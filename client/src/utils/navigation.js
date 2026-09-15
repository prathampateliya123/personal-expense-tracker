/**
 * utils/navigation.js
 * Sidebar links and page metadata (no UI imports).
 */

export const SIDEBAR_WIDTH = 272;
export const SETTINGS_SIDEBAR_WIDTH = 240;

/** Main app navigation */
export const NAV_ITEMS = [
  { key: "dashboard", to: "/dashboard", label: "Dashboard", end: true },
  { key: "expenses", to: "/expenses", label: "Expenses" },
  { key: "incomes", to: "/incomes", label: "Incomes" },
  { key: "budgets", to: "/budgets", label: "Budgets" },
  { key: "categories", to: "/categories", label: "Categories" },
  { key: "settings", to: "/settings", label: "Settings" },
];

/** Nested settings sidebar */
export const SETTINGS_NAV_ITEMS = [
  {
    key: "paymentMethods",
    to: "/settings/payment-methods",
    label: "Payment methods",
  },
];

export const PAGE_META = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Your financial overview at a glance",
    breadcrumb: ["Home", "Dashboard"],
  },
  "/expenses": {
    title: "Expenses",
    subtitle: "Track and manage your spending",
    breadcrumb: ["Home", "Expenses"],
  },
  "/expenses/add": {
    title: "Add expense",
    subtitle: "Record a new transaction",
    breadcrumb: ["Home", "Expenses", "Add"],
  },
  "/incomes": {
    title: "Incomes",
    subtitle: "Track and manage money you receive",
    breadcrumb: ["Home", "Incomes"],
  },
  "/incomes/add": {
    title: "Add income",
    subtitle: "Record a new income entry",
    breadcrumb: ["Home", "Incomes", "Add"],
  },
  "/categories": {
    title: "Categories",
    subtitle: "Organize expenses and incomes with custom categories",
    breadcrumb: ["Home", "Categories"],
  },
  "/budgets": {
    title: "Budget planning",
    subtitle: "Set monthly limits and track category spending",
    breadcrumb: ["Home", "Budgets"],
  },
  "/settings": {
    title: "Settings",
    subtitle: "Manage app preferences",
    breadcrumb: ["Home", "Settings"],
  },
  "/settings/payment-methods": {
    title: "Payment methods",
    subtitle: "Manage Cash, UPI, Card, and more",
    breadcrumb: ["Home", "Settings", "Payment methods"],
  },
};

export const getPageMeta = (pathname) =>
  PAGE_META[pathname] || {
    title: "Dashboard",
    subtitle: "Your financial overview at a glance",
    breadcrumb: ["Home", "Dashboard"],
  };
