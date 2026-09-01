/**
 * components/dashboard/Sidebar.jsx
 * App sidebar with grouped navigation and user summary.
 */

import { NavLink } from "react-router-dom";
import {
  IconDashboard,
  IconExpenses,
  IconBudget,
  IconGoals,
  IconReports,
  IconSettings,
  IconClose,
} from "./icons";

const navSections = [
  {
    title: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: IconDashboard, end: true },
    ],
  },
  {
    title: "Finance",
    items: [
      { to: "/expenses", label: "Expenses", icon: IconExpenses, disabled: true },
      { to: "/budgets", label: "Budgets", icon: IconBudget, disabled: true },
      { to: "/goals", label: "Goals", icon: IconGoals, disabled: true },
      { to: "/reports", label: "Reports", icon: IconReports, disabled: true },
    ],
  },
  {
    title: "Account",
    items: [
      { to: "/settings", label: "Settings", icon: IconSettings, disabled: true },
    ],
  },
];

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const NavItem = ({ to, label, icon: Icon, end, disabled, onNavigate }) => {
  if (disabled) {
    return (
      <div
        className="group flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-500/60"
        title="Coming soon"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-ink-400/50">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <span className="flex-1">{label}</span>
        <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-400/70">
          Soon
        </span>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
          isActive
            ? "bg-brand-600/20 text-brand-200 shadow-sm shadow-brand-900/20"
            : "text-ink-300 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
              isActive
                ? "bg-brand-600 text-white"
                : "bg-white/5 text-ink-300 group-hover:bg-white/10 group-hover:text-white"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <span className="flex-1">{label}</span>
          {isActive && (
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          )}
        </>
      )}
    </NavLink>
  );
};

const Sidebar = ({ user, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-ink-950/60 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col bg-ink-950 shadow-sidebar transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-lg shadow-brand-900/40">
              ₹
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight text-white">
                ExpenseTracker
              </p>
              <p className="text-[11px] text-ink-400">Personal Finance</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 transition hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <IconClose />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavItem
                      key={item.label}
                      {...item}
                      onNavigate={onClose}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* User card */}
        <div className="shrink-0 border-t border-white/5 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600/20 text-sm font-semibold text-brand-300 ring-2 ring-brand-600/30">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs text-ink-400">
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
