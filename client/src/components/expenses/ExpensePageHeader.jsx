/**
 * components/expenses/ExpensePageHeader.jsx
 * Back link and title for add/edit expense pages.
 */

import { Link } from "react-router-dom";

const ExpensePageHeader = ({ title, subtitle }) => (
  <div className="flex w-full flex-col gap-4 border-b border-surface-border pb-6">
    <Link
      to="/expenses"
      className="inline-flex w-fit items-center gap-2 text-sm font-medium text-ink-500 transition hover:text-brand-600"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      Back to expenses
    </Link>
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm text-ink-400">{subtitle}</p>
      )}
    </div>
  </div>
);

export default ExpensePageHeader;
