/**
 * components/expenses/ExpenseFilters.jsx
 * Full-width filter bar with category, payment mode, date range, and search.
 */

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_MODES,
} from "../../config/expenseConstants";
import {
  setFilters,
  resetFilters,
  fetchExpenses,
} from "../../redux/slices/expenseSlice";
import Select from "../ui/Select";

const fieldClass =
  "w-full rounded-xl border border-surface-border bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

const labelClass = "mb-1 block text-xs font-medium text-ink-500";

const ExpenseFilters = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.expenses);
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        const nextFilters = { ...filters, search: searchInput, page: 1 };
        dispatch(setFilters({ search: searchInput, page: 1 }));
        dispatch(fetchExpenses(nextFilters));
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilter = (updates) => {
    const nextFilters = { ...filters, ...updates, page: 1 };
    dispatch(setFilters({ ...updates, page: 1 }));
    dispatch(fetchExpenses(nextFilters));
  };

  const handleClear = () => {
    setSearchInput("");
    dispatch(resetFilters());
    dispatch(
      fetchExpenses({
        category: "",
        paymentMode: "",
        startDate: "",
        endDate: "",
        search: "",
        page: 1,
        limit: 10,
        sortBy: "date",
      })
    );
  };

  const hasActiveFilters =
    filters.category ||
    filters.paymentMode ||
    filters.startDate ||
    filters.endDate ||
    filters.search;

  return (
    <div className="card w-full p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink-800">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm font-medium text-brand-600 transition hover:text-brand-700"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="xl:col-span-2">
          <label className={labelClass}>Search</label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title..."
            className={`${fieldClass} placeholder:text-ink-300`}
          />
        </div>

        <Select
          id="filter-category"
          label="Category"
          labelClassName={labelClass}
          value={filters.category}
          onChange={(e) => applyFilter({ category: e.target.value })}
          placeholder="All categories"
          options={EXPENSE_CATEGORIES}
          size="sm"
        />

        <Select
          id="filter-payment"
          label="Payment mode"
          labelClassName={labelClass}
          value={filters.paymentMode}
          onChange={(e) => applyFilter({ paymentMode: e.target.value })}
          placeholder="All modes"
          options={PAYMENT_MODES}
          size="sm"
        />

        <div>
          <label className={labelClass}>From date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => applyFilter({ startDate: e.target.value })}
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>To date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => applyFilter({ endDate: e.target.value })}
            className={fieldClass}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpenseFilters;
