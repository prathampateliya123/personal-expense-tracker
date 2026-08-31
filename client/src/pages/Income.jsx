/**
 * pages/Income.jsx
 * Income management page — form, filter bar, and income list.
 * Coordinates Redux thunks for CRUD operations with toast feedback.
 */

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import IncomeForm from "../components/IncomeForm";
import IncomeList from "../components/IncomeList";
import { INCOME_SOURCES } from "../utils/incomeConstants";
import {
  fetchIncomes,
  addIncome,
  updateIncome,
  deleteIncome,
  setFilters,
  clearFilters,
  setPage,
  clearError,
} from "../redux/incomeSlice";

const Income = () => {
  const dispatch = useDispatch();
  const { incomes, loading, error, filters, pagination } = useSelector(
    (state) => state.incomes
  );
  const [editingIncome, setEditingIncome] = useState(null);

  // Fetch incomes on mount and when page changes
  useEffect(() => {
    dispatch(fetchIncomes());
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
    dispatch(fetchIncomes());
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    dispatch(fetchIncomes());
  };

  const handleAddOrUpdate = async (formData) => {
    if (editingIncome) {
      const result = await dispatch(
        updateIncome({ id: editingIncome._id, incomeData: formData })
      );
      if (updateIncome.fulfilled.match(result)) {
        toast.success("Income updated successfully");
        setEditingIncome(null);
        dispatch(fetchIncomes());
      }
    } else {
      const result = await dispatch(addIncome(formData));
      if (addIncome.fulfilled.match(result)) {
        toast.success("Income added successfully");
        dispatch(fetchIncomes());
      }
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income entry?")) {
      return;
    }
    const result = await dispatch(deleteIncome(id));
    if (deleteIncome.fulfilled.match(result)) {
      toast.success("Income deleted successfully");
      if (editingIncome?._id === id) {
        setEditingIncome(null);
      }
    }
  };

  const inputClass =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Income</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track and manage your earnings
        </p>
      </div>

      {/* Add / Edit form */}
      <IncomeForm
        income={editingIncome}
        onSubmit={handleAddOrUpdate}
        onCancel={() => setEditingIncome(null)}
        loading={loading}
      />

      {/* Filter bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Filters</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Source
            </label>
            <select
              name="source"
              value={filters.source}
              onChange={handleFilterChange}
              className={inputClass}
            >
              <option value="">All sources</option>
              {INCOME_SOURCES.map(({ value, label }) => (
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

      {/* Income list */}
      <IncomeList
        incomes={incomes}
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

export default Income;
