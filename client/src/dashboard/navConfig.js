/**
 * dashboard/navConfig.js
 * Sidebar links and page metadata.
 */

import {
  IconDashboard,
  IconExpenses,
  IconBudget,
  IconGoals,
  IconReports,
  IconSettings,
} from "../components/dashboard/icons";

export const SIDEBAR_WIDTH = 240;

export const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: IconDashboard, end: true },
  { to: "/expenses", label: "Expenses", icon: IconExpenses, disabled: true },
  { to: "/budgets", label: "Budgets", icon: IconBudget, disabled: true },
  { to: "/goals", label: "Goals", icon: IconGoals, disabled: true },
  { to: "/reports", label: "Reports", icon: IconReports, disabled: true },
  { to: "/settings", label: "Settings", icon: IconSettings, disabled: true },
];

export const pageMeta = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Your financial overview at a glance",
    breadcrumb: ["Home", "Dashboard"],
  },
};

export const getPageMeta = (pathname) =>
  pageMeta[pathname] || {
    title: "Dashboard",
    subtitle: "Your financial overview at a glance",
    breadcrumb: ["Home", "Dashboard"],
  };
