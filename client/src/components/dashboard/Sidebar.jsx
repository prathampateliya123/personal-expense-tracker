/**
 * components/dashboard/Sidebar.jsx
 * Simple flat sidebar navigation.
 */

import { NavLink } from "react-router-dom";
import { IconClose } from "./icons";
import { navItems, SIDEBAR_WIDTH } from "../../dashboard/navConfig";

const NavItem = ({ to, label, icon: Icon, end, disabled, onNavigate }) => {
  if (disabled) {
    return (
      <div
        className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-500/60"
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
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? "bg-brand-600/20 text-brand-200"
            : "text-ink-300 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`h-5 w-5 shrink-0 ${
              isActive ? "text-brand-400" : "text-ink-400"
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
        className={`fixed inset-0 z-40 bg-ink-950/60 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        style={{ width: SIDEBAR_WIDTH }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-ink-950 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              ₹
            </span>
            <span className="text-sm font-semibold text-white">
              ExpenseTracker
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <IconClose />
          </button>
        </div>

        {/* Nav links */}
        <nav className="sidebar-scroll flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavItem key={item.label} {...item} onNavigate={onClose} />
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
