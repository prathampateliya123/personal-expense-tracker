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
  if (percent > 100) return { bar: "bg-expense", text: "text-expense" };
  if (percent >= 70) return { bar: "bg-warning", text: "text-warning" };
  return { bar: "bg-income", text: "text-income" };
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

  const selectedMonthLabel =
    MONTH_OPTIONS.find(
      (o) => o.month === selectedMonth && o.year === selectedYear
    )?.label || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-heading">Budget Planner</h1>
        <p className="page-subheading">
          Set monthly spending limits and track your progress
        </p>
      </div>

      {/* Set budget form */}
      <form onSubmit={handleSubmit} className="card p-6">
        <h2 className="section-heading mb-4">Set Budget</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">
              Category
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleFormChange}
              className="input-field"
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
            <label className="mb-1 block text-sm font-medium text-textSecondary">
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
              className="input-field"
              placeholder="5000"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">
              Month
            </label>
            <select
              name="monthYear"
              required
              value={formData.monthYear}
              onChange={handleFormChange}
              className="input-field"
            >
              {MONTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-4">
          {loading ? "Saving..." : "Save Budget"}
        </button>
      </form>

      {/* Month filter for budget list */}
      <div className="flex items-center justify-between">
        <h2 className="section-heading">Budgets for {selectedMonthLabel}</h2>
        <select
          value={`${selectedYear}-${selectedMonth}`}
          onChange={handleMonthFilterChange}
          className="input-field w-auto"
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
        <div className="card flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="card flex h-48 items-center justify-center">
          <p className="text-sm text-textMuted">No budgets set for this month</p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const colors = getProgressColor(budget.percentageUsed);
            const barWidth = Math.min(budget.percentageUsed, 100);

            return (
              <div key={budget._id} className="card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="badge-primary px-3 py-1 text-sm">
                      {budget.category}
                    </span>
                    <span className={`text-sm font-semibold ${colors.text}`}>
                      {budget.percentageUsed}% used
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(budget._id)}
                    title="Delete budget"
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

                {/* Progress bar */}
                <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-background">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-xs text-textMuted">
                  <span>Spent: {formatCurrency(budget.currentSpent)}</span>
                  <span>Limit: {formatCurrency(budget.monthlyLimit)}</span>
                  <span>Remaining: {formatCurrency(budget.remaining)}</span>
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
