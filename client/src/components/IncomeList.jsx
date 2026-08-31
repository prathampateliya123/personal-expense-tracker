/**
 * components/IncomeList.jsx
 * Displays income entries in a responsive table with edit and delete actions.
 */

import { INCOME_SOURCES } from "../utils/incomeConstants";

const sourceLabel = (source) =>
  INCOME_SOURCES.find((s) => s.value === source)?.label || source;

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

const IncomeList = ({ incomes, loading, onEdit, onDelete }) => {
  if (loading && incomes.length === 0) {
    return (
      <div className="card flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!loading && incomes.length === 0) {
    return (
      <div className="card flex h-48 items-center justify-center">
        <p className="text-sm text-textMuted">No income entries found</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="table-header">
            <tr>
              <th className="px-4 py-3 font-medium text-textSecondary">Source</th>
              <th className="px-4 py-3 font-medium text-textSecondary">Amount</th>
              <th className="px-4 py-3 font-medium text-textSecondary">Date</th>
              <th className="px-4 py-3 font-medium text-textSecondary">Description</th>
              <th className="px-4 py-3 font-medium text-textSecondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {incomes.map((income) => (
              <tr key={income._id} className="table-row">
                <td className="px-4 py-3">
                  <span className="badge bg-income/15 text-income">
                    {sourceLabel(income.source)}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-income">
                  {formatAmount(income.amount)}
                </td>
                <td className="px-4 py-3 text-textSecondary">
                  {formatDate(income.date)}
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-textMuted">
                  {income.description || "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(income)}
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
                      onClick={() => onDelete(income._id)}
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

export default IncomeList;
