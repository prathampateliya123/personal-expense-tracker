/**
 * components/dashboard/DashboardHeader.jsx
 * Top header with breadcrumbs, search, and user profile.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  IconMenu,
  IconSearch,
  IconBell,
  IconChevronDown,
  IconChevronRight,
  IconPlus,
  IconLogout,
  IconSettings,
} from "./icons";
import { getPageMeta } from "../../dashboard/navConfig";
import { getInitials, formatHeaderDate } from "../../dashboard/utils";

const DashboardHeader = ({ user, onMenuClick, onLogout, logoutLoading }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const pageInfo = getPageMeta(location.pathname);

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
    <header className="sticky top-0 z-30 shrink-0 border-b border-surface-border bg-white/80 backdrop-blur-xl">
      {/* Top bar */}
      <div className="flex h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="shrink-0 rounded-xl border border-surface-border bg-white p-2.5 text-ink-600 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 lg:hidden"
            aria-label="Open menu"
          >
            <IconMenu />
          </button>

          <div className="min-w-0">
            {/* Breadcrumb */}
            <nav className="mb-1 flex items-center gap-1 text-xs text-ink-400">
              {pageInfo.breadcrumb.map((crumb, i) => (
                <span key={crumb} className="flex items-center gap-1">
                  {i > 0 && <IconChevronRight className="h-3 w-3 text-ink-300" />}
                  {i === pageInfo.breadcrumb.length - 1 ? (
                    <span className="font-medium text-brand-600">{crumb}</span>
                  ) : (
                    <Link to="/dashboard" className="hover:text-ink-600">
                      {crumb}
                    </Link>
                  )}
                </span>
              ))}
            </nav>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h1 className="truncate text-lg font-semibold tracking-tight text-ink-900 sm:text-xl">
                {pageInfo.title}
              </h1>
              <p className="hidden text-xs text-ink-400 md:inline">
                {formatHeaderDate()}
              </p>
            </div>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="relative hidden lg:block">
            <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              type="search"
              disabled
              placeholder="Search..."
              className="w-52 rounded-xl border border-surface-border bg-surface-muted/80 py-2.5 pl-10 pr-4 text-sm text-ink-900 placeholder:text-ink-300 xl:w-60"
            />
          </div>

          <button
            type="button"
            disabled
            title="Coming soon"
            className="hidden items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/25 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
          >
            <IconPlus className="h-4 w-4" />
            Add Expense
          </button>

          <button
            type="button"
            disabled
            className="relative rounded-xl border border-surface-border bg-white p-2.5 text-ink-500 shadow-sm transition hover:bg-surface-muted hover:text-ink-800 disabled:opacity-50"
            aria-label="Notifications"
          >
            <IconBell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-expense ring-2 ring-white" />
          </button>

          {/* User dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-xl border border-surface-border bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/50"
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
                <p className="max-w-[100px] truncate text-sm font-semibold text-ink-900">
                  {user?.name?.split(" ")[0]}
                </p>
                <p className="max-w-[100px] truncate text-[10px] text-ink-400">
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
                      <p className="truncate text-xs text-ink-400">
                        {user?.email}
                      </p>
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
        </div>
      </div>

      {/* Sub-header strip */}
      <div className="hidden border-t border-surface-border bg-surface-muted/40 px-4 py-2 sm:px-6 lg:flex lg:px-8">
        <p className="text-xs text-ink-500">{pageInfo.subtitle}</p>
      </div>
    </header>
  );
};

export default DashboardHeader;
