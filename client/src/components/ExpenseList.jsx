/**
 * components/ExpenseList.jsx
 * Displays expenses in a responsive table with edit and delete actions.
 */

import { PAYMENT_MODES } from "../utils/expenseConstants";

const paymentLabel = (mode) =>
  PAYMENT_MODES.find((p) => p.value === mode)?.label || mode;

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

const ExpenseList = ({ expenses, loading, onEdit, onDelete }) => {
  if (loading && expenses.length === 0) {
    return (
      <div className="card flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!loading && expenses.length === 0) {
    return (
      <div className="card flex h-48 items-center justify-center">
        <p className="text-sm text-textMuted">No expenses found</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="table-header">
            <tr>
              <th className="px-4 py-3 font-medium text-textSecondary">Title</th>
              <th className="px-4 py-3 font-medium text-textSecondary">Amount</th>
              <th className="px-4 py-3 font-medium text-textSecondary">Category</th>
              <th className="px-4 py-3 font-medium text-textSecondary">Payment</th>
              <th className="px-4 py-3 font-medium text-textSecondary">Date</th>
              <th className="px-4 py-3 font-medium text-textSecondary">Description</th>
              <th className="px-4 py-3 font-medium text-textSecondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id} className="table-row">
                <td className="px-4 py-3 font-medium text-textPrimary">
                  {expense.title}
                </td>
                <td className="px-4 py-3 text-expense">
                  {formatAmount(expense.amount)}
                </td>
                <td className="px-4 py-3">
                  <span className="badge-primary">{expense.category}</span>
                </td>
                <td className="px-4 py-3 capitalize text-textSecondary">
                  {paymentLabel(expense.paymentMode)}
                </td>
                <td className="px-4 py-3 text-textSecondary">
                  {formatDate(expense.date)}
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-textMuted">
                  {expense.description || "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(expense)}
                      title="Edit"
                      className="rounded-lg p-1.5 text-textMuted transition hover:bg-primary/10 hover:text-primary"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(expense._id)}
                      title="Delete"
                      className="rounded-lg p-1.5 text-textMuted transition hover:bg-expense/10 hover:text-expense"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseList;
