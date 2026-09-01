/**
 * components/dashboard/PageHeader.jsx
 * Page title, breadcrumb, search & actions — shown inside content area.
 */

import { Link } from "react-router-dom";
import {
  IconSearch,
  IconBell,
  IconPlus,
  IconChevronRight,
} from "./icons";
import { formatHeaderDate } from "../../dashboard/utils";

const PageHeader = ({ title, subtitle, breadcrumb = [] }) => {
  return (
    <div className="mb-6 space-y-4">
      {/* Breadcrumb + date */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1 text-xs text-ink-400">
          {breadcrumb.map((crumb, i) => (
            <span key={crumb} className="flex items-center gap-1">
              {i > 0 && <IconChevronRight className="h-3 w-3 text-ink-300" />}
              {i === breadcrumb.length - 1 ? (
                <span className="font-medium text-brand-600">{crumb}</span>
              ) : (
                <Link to="/dashboard" className="hover:text-ink-600">
                  {crumb}
                </Link>
              )}
            </span>
          ))}
        </nav>
        <p className="text-xs text-ink-400">{formatHeaderDate()}</p>
      </div>

      {/* Title row + actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-none">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              type="search"
              disabled
              placeholder="Search..."
              className="w-full rounded-xl border border-surface-border bg-white py-2.5 pl-9 pr-4 text-sm text-ink-900 placeholder:text-ink-300 sm:w-52 lg:w-60"
            />
          </div>

          <button
            type="button"
            disabled
            title="Coming soon"
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Expense</span>
          </button>

          <button
            type="button"
            disabled
            className="relative rounded-xl border border-surface-border bg-white p-2.5 text-ink-500 transition hover:bg-surface-muted disabled:opacity-50"
            aria-label="Notifications"
          >
            <IconBell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-expense ring-2 ring-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
