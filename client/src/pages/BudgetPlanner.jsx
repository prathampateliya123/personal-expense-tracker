/**
 * pages/BudgetPlanner.jsx
 * Budget planner page — set monthly category limits and track progress.
 * Progress bars are color-coded: green (<70%), yellow (70–100%), red (>100%).
 */

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { EXPENSE_CATEGORIES } from "../utils/expenseConstants";
import {
  fetchBudgets,
  setBudget,
  deleteBudget,
  setSelectedMonth,
  clearError,
} from "../redux/budgetSlice";

/** Generate month options for the last 12 months + next 3 months */
const generateMonthOptions = () => {
  const options = [];
  const now = new Date();

  for (let i = -12; i <= 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    options.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      label: date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      value: `${date.getFullYear()}-${date.getMonth() + 1}`,
    });
  }

  return options;
};

const MONTH_OPTIONS = generateMonthOptions();

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

/** Return Tailwind color classes based on usage percentage */
const getProgressColor = (percent) => {
  if (percent > 100) return { bar: "bg-red-500", text: "text-red-600" };
  if (percent >= 70) return { bar: "bg-yellow-500", text: "text-yellow-600" };
  return { bar: "bg-green-500", text: "text-green-600" };
};

const BudgetPlanner = () => {
  const dispatch = useDispatch();
  const { budgets, loading, error, selectedMonth, selectedYear } = useSelector(
    (state) => state.budgets
  );

  const [formData, setFormData] = useState({
    category: "",
    monthlyLimit: "",
    monthYear: `${selectedYear}-${selectedMonth}`,
  });

  useEffect(() => {
    dispatch(fetchBudgets());
  }, [dispatch, selectedMonth, selectedYear]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleMonthFilterChange = (e) => {
    const [year, month] = e.target.value.split("-").map(Number);
    dispatch(setSelectedMonth({ month, year }));
    setFormData((prev) => ({ ...prev, monthYear: e.target.value }));
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const [year, month] = formData.monthYear.split("-").map(Number);

    const result = await dispatch(
      setBudget({
        category: formData.category,
        monthlyLimit: parseFloat(formData.monthlyLimit),
        month,
        year,
      })
    );

    if (setBudget.fulfilled.match(result)) {
      toast.success("Budget saved successfully");
      setFormData({
        category: "",
        monthlyLimit: "",
        monthYear: formData.monthYear,
      });
      dispatch(fetchBudgets());
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;

    const result = await dispatch(deleteBudget(id));
    if (deleteBudget.fulfilled.match(result)) {
      toast.success("Budget deleted successfully");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  const selectedMonthLabel =
    MONTH_OPTIONS.find(
      (o) => o.month === selectedMonth && o.year === selectedYear
    )?.label || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Budget Planner</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set monthly spending limits and track your progress
        </p>
      </div>

      {/* Set budget form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Set Budget</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleFormChange}
              className={inputClass}
            >
              <option value="">Select category</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Monthly Limit (₹)
            </label>
            <input
              name="monthlyLimit"
              type="number"
              required
              min="1"
              step="0.01"
              value={formData.monthlyLimit}
              onChange={handleFormChange}
              className={inputClass}
              placeholder="5000"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Month
            </label>
            <select
              name="monthYear"
              required
              value={formData.monthYear}
              onChange={handleFormChange}
              className={inputClass}
            >
              {MONTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Budget"}
        </button>
      </form>

      {/* Month filter for budget list */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">
          Budgets for {selectedMonthLabel}
        </h2>
        <select
          value={`${selectedYear}-${selectedMonth}`}
          onChange={handleMonthFilterChange}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        >
          {MONTH_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Budget list with progress bars */}
      {loading && budgets.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-gray-200 bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-gray-200 bg-white">
          <p className="text-sm text-gray-400">
            No budgets set for this month
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const colors = getProgressColor(budget.percentageUsed);
            const barWidth = Math.min(budget.percentageUsed, 100);

            return (
              <div
                key={budget._id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                      {budget.category}
                    </span>
                    <span className={`text-sm font-semibold ${colors.text}`}>
                      {budget.percentageUsed}% used
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(budget._id)}
                    title="Delete budget"
                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
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

                {/* Progress bar */}
                <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>
                    Spent: {formatCurrency(budget.currentSpent)}
                  </span>
                  <span>
                    Limit: {formatCurrency(budget.monthlyLimit)}
                  </span>
                  <span>
                    Remaining: {formatCurrency(budget.remaining)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetPlanner;
