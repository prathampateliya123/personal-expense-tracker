export const SIDEBAR_WIDTH = 272;
export const SETTINGS_SIDEBAR_WIDTH = 240;


export const NAV_ITEMS = [
  { key: "dashboard", to: "/dashboard", label: "Dashboard", end: true },
  { key: "expenses", to: "/expenses", label: "Expenses" },
  { key: "incomes", to: "/incomes", label: "Incomes" },
  { key: "budgets", to: "/budgets", label: "Budgets" },
  { key: "subscriptions", to: "/subscriptions", label: "Subscriptions" },
  { key: "wealth", to: "/wealth", label: "Wealth" },
  { key: "categories", to: "/categories", label: "Categories" },
  { key: "settings", to: "/settings", label: "Settings" },
];


export const MOBILE_NAV_ITEMS = [
  { key: "dashboard", to: "/dashboard", label: "Dashboard", end: true },
  { key: "expenses", to: "/expenses", label: "Expenses" },
  { key: "incomes", to: "/incomes", label: "Incomes" },
  { key: "subscriptions", to: "/subscriptions", label: "Subscriptions" },
  { key: "settings", to: "/settings", label: "Settings" },
];


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
  "/subscriptions": {
    title: "Subscriptions",
    subtitle: "Track recurring bills and auto-add expenses on billing day",
    breadcrumb: ["Home", "Subscriptions"],
  },
  "/subscriptions/add": {
    title: "Add subscription",
    subtitle: "Set up a recurring bill with optional auto-expense",
    breadcrumb: ["Home", "Subscriptions", "Add"],
  },
  "/wealth": {
    title: "Savings & Investments",
    subtitle: "Manage saving goals and investment portfolio",
    breadcrumb: ["Home", "Wealth"],
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
