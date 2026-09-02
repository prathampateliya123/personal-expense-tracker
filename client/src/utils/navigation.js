/**
 * utils/navigation.js
 * Sidebar links and page metadata (no UI imports).
 */

export const SIDEBAR_WIDTH = 272;

export const NAV_ITEMS = [
  { key: "dashboard", to: "/dashboard", label: "Dashboard", end: true },
  { key: "expenses", to: "/expenses", label: "Expenses" },
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
};

export const getPageMeta = (pathname) =>
  PAGE_META[pathname] || {
    title: "Dashboard",
    subtitle: "Your financial overview at a glance",
    breadcrumb: ["Home", "Dashboard"],
  };
