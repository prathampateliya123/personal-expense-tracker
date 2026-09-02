/**
 * components/layout/DashboardHeader.jsx
 * Top bar with user profile menu.
 */

import { useEffect, useRef, useState } from "react";
import {
  IconMenu,
  IconChevronDown,
  IconLogout,
  IconSettings,
} from "./icons";
import { getInitials } from "../../utils/helpers";

const DashboardHeader = ({ user, onMenuClick, onLogout, logoutLoading }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-surface-border bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-xl border border-surface-border bg-white p-2.5 text-ink-600 transition hover:bg-surface-muted lg:hidden"
        aria-label="Open menu"
      >
        <IconMenu />
      </button>

      <div className="hidden lg:block" />

      <div className="relative ml-auto" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-2.5 rounded-xl border border-surface-border bg-white py-1.5 pl-1.5 pr-3 transition hover:border-brand-200 hover:bg-brand-50/40"
          aria-expanded={menuOpen}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-9 w-9 rounded-lg object-cover"
              />
            ) : (
              getInitials(user?.name)
            )}
          </div>
          <div className="hidden text-left sm:block">
            <p className="max-w-[120px] truncate text-sm font-semibold text-ink-900">
              {user?.name}
            </p>
            <p className="max-w-[120px] truncate text-[11px] text-ink-400">
              {user?.email}
            </p>
          </div>
          <IconChevronDown
            className={`hidden h-4 w-4 text-ink-400 transition-transform sm:block ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card">
            <div className="border-b border-surface-border bg-surface-muted/50 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
                  {getInitials(user?.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {user?.name}
                  </p>
                  <p className="truncate text-xs text-ink-400">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                type="button"
                disabled
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-surface-muted disabled:opacity-50"
              >
                <IconSettings className="h-4 w-4 text-ink-400" />
                Account Settings
                <span className="ml-auto text-[10px] font-semibold uppercase text-ink-300">
                  Soon
                </span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-accent-expense transition hover:bg-rose-50 disabled:opacity-60"
              >
                <IconLogout className="h-4 w-4" />
                {logoutLoading ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
