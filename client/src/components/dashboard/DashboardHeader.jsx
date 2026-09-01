/**
 * components/dashboard/DashboardHeader.jsx
 * Top header with search, notifications, and user menu.
 */

import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  IconMenu,
  IconSearch,
  IconBell,
  IconChevronDown,
  IconLogout,
} from "./icons";

const pageTitles = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Overview of your finances",
  },
};

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const DashboardHeader = ({ user, onMenuClick, onLogout, logoutLoading }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const pageInfo = pageTitles[location.pathname] || {
    title: "Dashboard",
    subtitle: "Overview of your finances",
  };

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
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-surface-border bg-surface-card/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Left: menu + title */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl border border-surface-border bg-white p-2 text-ink-600 transition hover:bg-surface-muted hover:text-ink-900 lg:hidden"
          aria-label="Open menu"
        >
          <IconMenu />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-ink-900">
            {pageInfo.title}
          </h1>
          <p className="hidden truncate text-xs text-ink-400 sm:block">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            type="search"
            disabled
            placeholder="Search transactions..."
            className="w-56 rounded-xl border border-surface-border bg-surface-muted py-2 pl-9 pr-4 text-sm text-ink-900 placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60 lg:w-64"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          disabled
          className="relative rounded-xl border border-surface-border bg-white p-2 text-ink-500 transition hover:bg-surface-muted hover:text-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
          title="Notifications (coming soon)"
          aria-label="Notifications"
        >
          <IconBell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-expense ring-2 ring-white" />
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl border border-surface-border bg-white py-1.5 pl-1.5 pr-2.5 transition hover:bg-surface-muted sm:gap-2.5 sm:pr-3"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-xs font-semibold text-brand-700">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-lg object-cover"
                />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <span className="hidden max-w-[120px] truncate text-sm font-medium text-ink-800 sm:block">
              {user?.name?.split(" ")[0]}
            </span>
            <IconChevronDown
              className={`hidden text-ink-400 transition-transform sm:block ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-xl border border-surface-border bg-white py-1 shadow-card">
              <div className="border-b border-surface-border px-4 py-3">
                <p className="truncate text-sm font-semibold text-ink-900">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-ink-400">{user?.email}</p>
              </div>

              <div className="p-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-accent-expense transition hover:bg-rose-50 disabled:opacity-60"
                >
                  <IconLogout className="h-4 w-4" />
                  {logoutLoading ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
