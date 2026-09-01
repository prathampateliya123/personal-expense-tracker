/**
 * components/dashboard/Sidebar.jsx
 * Organized sidebar with grouped navigation and footer actions.
 */

import { NavLink } from "react-router-dom";
import { IconClose, IconLogout, IconHelp } from "./icons";
import { navSections, SIDEBAR_WIDTH } from "../../dashboard/navConfig";

const NavItem = ({ to, label, icon: Icon, description, end, disabled, onNavigate }) => {
  if (disabled) {
    return (
      <div
        className="group relative flex cursor-not-allowed items-start gap-3 rounded-xl px-3 py-2.5 opacity-50"
        title="Coming soon"
      >
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-ink-400">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-ink-300">{label}</span>
            <span className="shrink-0 rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ink-500">
              Soon
            </span>
          </div>
          {description && (
            <p className="mt-0.5 text-[11px] text-ink-500">{description}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
          isActive
            ? "bg-brand-600/15 text-white"
            : "text-ink-300 hover:bg-white/[0.04] hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-brand-500" />
          )}
          <span
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
              isActive
                ? "bg-brand-600 text-white shadow-md shadow-brand-900/30"
                : "bg-white/[0.04] text-ink-300 group-hover:bg-white/[0.08] group-hover:text-white"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <span className="block text-sm font-medium">{label}</span>
            {description && (
              <span
                className={`mt-0.5 block text-[11px] ${
                  isActive ? "text-brand-200/80" : "text-ink-500 group-hover:text-ink-400"
                }`}
              >
                {description}
              </span>
            )}
          </div>
        </>
      )}
    </NavLink>
  );
};

const Sidebar = ({ isOpen, onClose, onLogout, logoutLoading }) => {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        style={{ width: SIDEBAR_WIDTH }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.06] bg-ink-950 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-[72px] shrink-0 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-base font-bold text-white shadow-lg shadow-brand-900/50">
                ₹
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-950 bg-brand-400" />
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-white">
                ExpenseTracker
              </p>
              <p className="text-[11px] font-medium text-ink-500">
                Smart Finance
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-ink-400 transition hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-5 h-px bg-white/[0.06]" />

        {/* Navigation */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-7">
            {navSections.map((section) => (
              <div key={section.id}>
                <p className="mb-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-500">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <NavItem key={item.label} {...item} onNavigate={onClose} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="shrink-0 space-y-2 border-t border-white/[0.06] p-4">
          <button
            type="button"
            disabled
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-400 transition hover:bg-white/[0.04] hover:text-ink-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]">
              <IconHelp className="h-[18px] w-[18px]" />
            </span>
            Help & Support
          </button>

          <button
            type="button"
            onClick={onLogout}
            disabled={logoutLoading}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-400/90 transition hover:bg-rose-500/10 disabled:opacity-60"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10">
              <IconLogout className="h-[18px] w-[18px]" />
            </span>
            {logoutLoading ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
