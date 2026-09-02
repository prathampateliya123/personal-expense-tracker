/**
 * pages/Expenses.jsx
 * Full-width expenses page — stats, filters, list, and pagination.
 */

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import ExpenseForm from "../components/expenses/ExpenseForm";
import ExpenseList from "../components/expenses/ExpenseList";
import ExpenseFilters from "../components/expenses/ExpenseFilters";
import { formatCurrency } from "../config/expenseConstants";
import {
  fetchExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  fetchExpenseStats,
  setFilters,
  clearExpenseError,
} from "../redux/slices/expenseSlice";

const ExpenseModal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm">
    <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink-900">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-ink-400 transition hover:bg-surface-muted hover:text-ink-700"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  </div>
);

const StatCard = ({ label, value, hint, valueClass = "text-ink-900" }) => (
  <div className="card flex min-h-[100px] w-full flex-col justify-center p-4 sm:p-5">
    <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
      {label}
    </p>
    <p className={`mt-1 text-2xl font-bold sm:text-3xl ${valueClass}`}>
      {value}
    </p>
    {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
  </div>
);

const Expenses = () => {
  const dispatch = useDispatch();
  const {
    expenses,
    totalCount,
    totalPages,
    currentPage,
    totalAmount,
    stats,
    filters,
    loading,
    saving,
    error,
  } = useSelector((state) => state.expenses);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchExpenseStats());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearExpenseError());
    }
  }, [error, dispatch]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingExpense(null);
  };

  const openAddModal = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    if (editingExpense) {
      const result = await dispatch(
        updateExpense({ id: editingExpense._id, data: formData })
      );
      if (updateExpense.fulfilled.match(result)) {
        toast.success("Expense updated successfully");
        closeModal();
        dispatch(fetchExpenses());
        dispatch(fetchExpenseStats());
      }
    } else {
      const result = await dispatch(addExpense(formData));
      if (addExpense.fulfilled.match(result)) {
        toast.success("Expense added successfully");
        closeModal();
        dispatch(fetchExpenses());
        dispatch(fetchExpenseStats());
      }
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    const result = await dispatch(deleteExpense(id));
    setDeleting(false);

    if (deleteExpense.fulfilled.match(result)) {
      toast.success("Expense deleted successfully");
      dispatch(fetchExpenses());
      dispatch(fetchExpenseStats());
    } else {
      toast.error("Failed to delete expense");
      throw new Error("Delete failed");
    }
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    dispatch(setFilters({ page }));
    dispatch(fetchExpenses({ ...filters, page }));
  };

  const monthLabel = stats
    ? new Date(stats.year, stats.month - 1).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "This month";

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      {/* Page header — full width */}
      <div className="flex w-full flex-col gap-4 border-b border-surface-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            Expenses
          </h1>
          <p className="mt-1 text-sm text-ink-400">
            Track and manage your spending across all categories
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="btn-primary shrink-0 self-start sm:self-auto"
        >
          + Add expense
        </button>
      </div>

      {/* Stats row — spans full width */}
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Filtered total"
          value={formatCurrency(totalAmount)}
          hint={`${totalCount} expense${totalCount !== 1 ? "s" : ""} in current view`}
          valueClass="text-accent-expense"
        />
        <StatCard
          label="Showing"
          value={expenses.length}
          hint={`Page ${currentPage} of ${totalPages}`}
        />
        <StatCard
          label={`${monthLabel} total`}
          value={formatCurrency(stats?.totalAmount)}
          hint="All expenses this month"
          valueClass="text-accent-expense"
        />
        <StatCard
          label={`${monthLabel} count`}
          value={stats?.count ?? 0}
          hint="Transactions this month"
        />
      </div>

      <ExpenseFilters />

      <ExpenseList
        expenses={expenses}
        loading={loading && !deleting}
        onEdit={openEditModal}
        onDelete={handleDelete}
        deleting={deleting}
      />

      {/* Pagination — full width bar */}
      <div className="card flex w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-sm text-ink-500">
          {totalCount > 0
            ? `Showing ${expenses.length} of ${totalCount} expenses`
            : "No expenses to display"}
          {totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="rounded-xl border border-surface-border bg-white px-4 py-2 text-sm font-medium text-ink-700 transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            className="rounded-xl border border-surface-border bg-white px-4 py-2 text-sm font-medium text-ink-700 transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {modalOpen && (
        <ExpenseModal
          title={editingExpense ? "Edit expense" : "Add expense"}
          onClose={closeModal}
        >
          <ExpenseForm
            initialData={editingExpense}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            loading={saving}
          />
        </ExpenseModal>
      )}
    </div>
  );
};

export default Expenses;
