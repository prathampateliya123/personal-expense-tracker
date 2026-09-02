/**
 * components/layout/Sidebar.jsx
 * Light fintech sidebar navigation.
 */

import { NavLink } from "react-router-dom";
import { NAV_ITEMS, SIDEBAR_WIDTH } from "../../config/navigation";
import {
  IconClose,
  IconDashboard,
  IconExpenses,
  IconBudget,
  IconGoals,
  IconReports,
  IconSettings,
} from "./icons";

const NAV_ICONS = {
  dashboard: IconDashboard,
  expenses: IconExpenses,
  budgets: IconBudget,
  goals: IconGoals,
  reports: IconReports,
  settings: IconSettings,
};

const NavItem = ({ to, label, icon: Icon, end, disabled, onNavigate }) => {
  if (disabled) {
    return (
      <div
        className="flex cursor-not-allowed items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-textSecondary/50"
        title="Coming soon"
      >
        <Icon className="h-5 w-5 shrink-0 opacity-50" />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? "bg-successBg text-primaryDark"
            : "text-textSecondary hover:bg-surfaceGray hover:text-textPrimary"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`h-5 w-5 shrink-0 ${
              isActive ? "text-accentGreen" : "text-textSecondary"
            }`}
          />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-textPrimary/20 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        style={{ width: SIDEBAR_WIDTH }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <span className="gradient-green-card flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm">
              ₹
            </span>
            <span className="text-sm font-semibold text-primaryDark">
              ExpenseTracker
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-textSecondary hover:bg-surfaceGray lg:hidden"
            aria-label="Close sidebar"
          >
            <IconClose />
          </button>
        </div>

        <nav className="sidebar-scroll flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.key}
              {...item}
              icon={NAV_ICONS[item.key]}
              onNavigate={onClose}
            />
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
