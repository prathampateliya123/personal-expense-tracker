/**
 * pages/Expenses.jsx
 * Expense management page — form, filter bar, and expense list.
 * Coordinates Redux thunks for CRUD operations with toast feedback.
 */

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_MODES,
} from "../utils/expenseConstants";
import {
  fetchExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  setFilters,
  clearFilters,
  setPage,
  clearError,
} from "../redux/expenseSlice";

const Expenses = () => {
  const dispatch = useDispatch();
  const { expenses, loading, error, filters, pagination } = useSelector(
    (state) => state.expenses
  );
  const [editingExpense, setEditingExpense] = useState(null);

  // Fetch expenses on mount and when page changes
  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch, pagination.page]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleFilterChange = (e) => {
    dispatch(setFilters({ [e.target.name]: e.target.value }));
  };

  const handleApplyFilters = () => {
    dispatch(fetchExpenses());
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    dispatch(fetchExpenses());
  };

  const handleAddOrUpdate = async (formData) => {
    if (editingExpense) {
      const result = await dispatch(
        updateExpense({ id: editingExpense._id, expenseData: formData })
      );
      if (updateExpense.fulfilled.match(result)) {
        toast.success("Expense updated successfully");
        setEditingExpense(null);
        dispatch(fetchExpenses());
      }
    } else {
      const result = await dispatch(addExpense(formData));
      if (addExpense.fulfilled.match(result)) {
        toast.success("Expense added successfully");
        dispatch(fetchExpenses());
      }
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }
    const result = await dispatch(deleteExpense(id));
    if (deleteExpense.fulfilled.match(result)) {
      toast.success("Expense deleted successfully");
      if (editingExpense?._id === id) {
        setEditingExpense(null);
      }
    }
  };

  const inputClass =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track and manage your spending
        </p>
      </div>

      {/* Add / Edit form */}
      <ExpenseForm
        expense={editingExpense}
        onSubmit={handleAddOrUpdate}
        onCancel={() => setEditingExpense(null)}
        loading={loading}
      />

      {/* Filter bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Filters</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className={inputClass}
            >
              <option value="">All categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Payment Mode
            </label>
            <select
              name="paymentMode"
              value={filters.paymentMode}
              onChange={handleFilterChange}
              className={inputClass}
            >
              <option value="">All modes</option>
              {PAYMENT_MODES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Start Date
            </label>
            <input
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              End Date
            </label>
            <input
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
              className={inputClass}
            />
          </div>

          <button
            onClick={handleApplyFilters}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Apply
          </button>
          <button
            onClick={handleClearFilters}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Expense list */}
      <ExpenseList
        expenses={expenses}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={pagination.page <= 1}
            onClick={() => dispatch(setPage(pagination.page - 1))}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => dispatch(setPage(pagination.page + 1))}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Expenses;
