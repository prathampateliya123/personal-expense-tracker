/**
 * layouts/Sidebar.jsx
 * Sidebar navigation — flex column on desktop, slide-over on mobile.
 */

import { NavLink } from "react-router-dom";
import { NAV_ITEMS, SIDEBAR_WIDTH } from "../utils/navigation";
import { IconClose, IconDashboard, IconExpenses } from "../components/ui/Icons";

const NAV_ICONS = {
  dashboard: IconDashboard,
  expenses: IconExpenses,
};

const NavItem = ({ to, label, icon: Icon, end, onNavigate }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onNavigate}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
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

const Sidebar = ({ isOpen, onClose }) => (
  <>
    {isOpen ? (
      <div
        className="fixed inset-0 z-30 bg-textPrimary/30 backdrop-blur-[2px] lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
    ) : null}

    <aside
      style={{ width: SIDEBAR_WIDTH }}
      className={[
        "flex h-full shrink-0 flex-col border-r border-border bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
        "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-40 max-lg:w-[min(272px,88vw)]",
        isOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
        "max-lg:transition-transform max-lg:duration-300",
      ].join(" ")}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 sm:h-16 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="gradient-green-card flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm">
            ₹
          </span>
          <span className="truncate text-sm font-semibold text-primaryDark">
            ExpenseTracker
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-textSecondary hover:bg-surfaceGray lg:hidden"
          aria-label="Close sidebar"
        >
          <IconClose />
        </button>
      </div>

      <nav className="sidebar-scroll min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-textSecondary/70">
          Menu
        </p>
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

export default Sidebar;
