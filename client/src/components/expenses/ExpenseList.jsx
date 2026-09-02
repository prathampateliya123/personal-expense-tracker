/**
 * components/expenses/ExpenseList.jsx
 * Table of expenses with edit/delete actions and loading skeleton.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CATEGORY_COLORS,
  formatCurrency,
  formatExpenseDate,
} from "../../config/expenseConstants";

const IconEdit = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const IconTrash = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-surface-border">
    {[1, 2, 3, 4, 5, 6].map((col) => (
      <td key={col} className="px-4 py-4">
        <div className="h-4 rounded bg-surface-muted" />
      </td>
    ))}
  </tr>
);

const ConfirmDialog = ({ title, message, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm">
    <div className="card w-full max-w-md p-6">
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm text-ink-500">{message}</p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 rounded-xl border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-surface-muted disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 rounded-xl bg-accent-expense px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

/**
 * @param {object} props
 * @param {Array} props.expenses
 * @param {boolean} props.loading
 * @param {function} props.onDelete
 * @param {boolean} [props.deleting]
 */
const ExpenseList = ({
  expenses,
  loading,
  onDelete,
  deleting = false,
}) => {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await onDelete(deleteTarget._id);
      setDeleteTarget(null);
    } catch {
      /* dialog stays open on failure */
    }
  };

  if (loading) {
    return (
      <div className="card w-full overflow-hidden">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="border-b border-surface-border bg-surface-muted/50">
            <tr>
              {["Date", "Title", "Category", "Payment", "Amount", "Actions"].map(
                (h) => (
                  <th key={h} className="px-4 py-3 font-semibold text-ink-600 lg:px-6">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((row) => (
              <SkeletonRow key={row} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <div className="card flex w-full flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl">
          ₹
        </div>
        <h3 className="text-lg font-semibold text-ink-900">No expenses found</h3>
        <p className="mt-1 max-w-sm text-sm text-ink-400">
          Try adjusting your filters or add your first expense to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="card w-full overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-full table-fixed text-left text-sm">
            <thead className="border-b border-surface-border bg-surface-muted/50">
              <tr>
                <th className="w-[11%] px-4 py-3 font-semibold text-ink-600 lg:px-6">
                  Date
                </th>
                <th className="w-[26%] px-4 py-3 font-semibold text-ink-600 lg:px-6">
                  Title
                </th>
                <th className="w-[14%] px-4 py-3 font-semibold text-ink-600 lg:px-6">
                  Category
                </th>
                <th className="w-[14%] px-4 py-3 font-semibold text-ink-600 lg:px-6">
                  Payment
                </th>
                <th className="w-[14%] px-4 py-3 text-right font-semibold text-ink-600 lg:px-6">
                  Amount
                </th>
                <th className="w-[11%] px-4 py-3 text-center font-semibold text-ink-600 lg:px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr
                  key={expense._id}
                  className="border-b border-surface-border last:border-0 hover:bg-surface-muted/30"
                >
                  <td className="whitespace-nowrap px-4 py-3.5 text-ink-600 lg:px-6">
                    {formatExpenseDate(expense.date)}
                  </td>
                  <td className="truncate px-4 py-3.5 font-medium text-ink-900 lg:px-6">
                    <span className="block truncate" title={expense.title}>
                      {expense.title}
                    </span>
                    {expense.description && (
                      <span
                        className="mt-0.5 block truncate text-xs text-ink-400"
                        title={expense.description}
                      >
                        {expense.description}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 lg:px-6">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        CATEGORY_COLORS[expense.category] ||
                        CATEGORY_COLORS.Other
                      }`}
                    >
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-ink-600 lg:px-6">
                    {expense.paymentMode}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-accent-expense lg:px-6">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-4 py-3.5 lg:px-6">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/expenses/${expense._id}/edit`}
                        className="rounded-lg border border-surface-border p-2 text-ink-500 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                        aria-label={`Edit ${expense.title}`}
                      >
                        <IconEdit />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(expense)}
                        className="rounded-lg border border-surface-border p-2 text-ink-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-accent-expense"
                        aria-label={`Delete ${expense.title}`}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete expense?"
          message={`Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => !deleting && setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </>
  );
};

export default ExpenseList;
