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
  const { incomes, loading, error, filters, pagination: paginationState } =
    useSelector((state) => state.incomes);
  const pagination = paginationState ?? { page: 1, limit: 10, total: 0, pages: 1 };
  const incomeList = incomes ?? [];
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-heading">Income</h1>
        <p className="page-subheading">Track and manage your earnings</p>
      </div>

      {/* Add / Edit form */}
      <IncomeForm
        income={editingIncome}
        onSubmit={handleAddOrUpdate}
        onCancel={() => setEditingIncome(null)}
        loading={loading}
      />

      {/* Filter bar */}
      <div className="card p-4">
        <h3 className="section-heading mb-3">Filters</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-textSecondary">
              Source
            </label>
            <select
              name="source"
              value={filters.source}
              onChange={handleFilterChange}
              className="input-field"
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

      {/* Income list */}
      <IncomeList
        incomes={incomeList}
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

export default Income;
