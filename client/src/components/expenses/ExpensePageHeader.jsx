/**
 * components/expenses/ExpensePageHeader.jsx
 * Back link and title for add/edit expense pages.
 */

import { Link } from "react-router-dom";
import { IconChevronLeft } from "../ui/Icons";

const ExpensePageHeader = ({ title, subtitle }) => (
  <div className="flex w-full flex-col gap-4 border-b border-border/60 pb-6">
    <Link
      to="/expenses"
      className="inline-flex w-fit items-center gap-2 text-sm font-medium text-textSecondary transition hover:text-accentGreen"
    >
      <IconChevronLeft />
      Back to expenses
    </Link>
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm text-textSecondary">{subtitle}</p>
      )}
    </div>
  </div>
);

export default ExpensePageHeader;
