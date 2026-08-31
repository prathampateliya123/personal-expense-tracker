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
  const { expenses, loading, error, filters, pagination: paginationState } =
    useSelector((state) => state.expenses);
  const pagination = paginationState ?? { page: 1, limit: 10, total: 0, pages: 1 };
  const expenseList = expenses ?? [];
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-heading">Expenses</h1>
        <p className="page-subheading">Track and manage your spending</p>
      </div>

      {/* Add / Edit form */}
      <ExpenseForm
        expense={editingExpense}
        onSubmit={handleAddOrUpdate}
        onCancel={() => setEditingExpense(null)}
        loading={loading}
      />

      {/* Filter bar */}
      <div className="card p-4">
        <h3 className="section-heading mb-3">Filters</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-textSecondary">
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="input-field"
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
            <label className="mb-1 block text-xs font-medium text-textSecondary">
              Payment Mode
            </label>
            <select
              name="paymentMode"
              value={filters.paymentMode}
              onChange={handleFilterChange}
              className="input-field"
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
            <label className="mb-1 block text-xs font-medium text-textSecondary">
              Start Date
            </label>
            <input
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-textSecondary">
              End Date
            </label>
            <input
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>

          <button onClick={handleApplyFilters} className="btn-primary">
            Apply
          </button>
          <button onClick={handleClearFilters} className="btn-secondary">
            Clear
          </button>
        </div>
      </div>

      {/* Expense list */}
      <ExpenseList
        expenses={expenseList}
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
            className="btn-secondary px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-textSecondary">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => dispatch(setPage(pagination.page + 1))}
            className="btn-secondary px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Expenses;
