/**
 * dashboard/navConfig.js
 * Sidebar navigation and page metadata.
 */

import {
  IconDashboard,
  IconExpenses,
  IconBudget,
  IconGoals,
  IconReports,
  IconSettings,
} from "../components/dashboard/icons";

export const SIDEBAR_WIDTH = 280;

export const navSections = [
  {
    id: "main",
    title: "Main Menu",
    items: [
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: IconDashboard,
        end: true,
        description: "Overview & summary",
      },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    items: [
      {
        to: "/expenses",
        label: "Expenses",
        icon: IconExpenses,
        disabled: true,
        description: "Track spending",
      },
      {
        to: "/budgets",
        label: "Budgets",
        icon: IconBudget,
        disabled: true,
        description: "Set limits",
      },
      {
        to: "/goals",
        label: "Goals",
        icon: IconGoals,
        disabled: true,
        description: "Save targets",
      },
      {
        to: "/reports",
        label: "Reports",
        icon: IconReports,
        disabled: true,
        description: "Analytics",
      },
    ],
  },
  {
    id: "account",
    title: "Preferences",
    items: [
      {
        to: "/settings",
        label: "Settings",
        icon: IconSettings,
        disabled: true,
        description: "Account & app",
      },
    ],
  },
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
