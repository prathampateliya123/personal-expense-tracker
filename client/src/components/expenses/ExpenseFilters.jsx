/**
 * components/expenses/ExpenseFilters.jsx
 * Filter bar with category, payment mode, date range, and debounced search.
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

const selectClass =
  "w-full rounded-xl border border-surface-border bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

const inputClass =
  "w-full rounded-xl border border-surface-border bg-white px-3 py-2.5 text-sm text-ink-900 outline-none placeholder:text-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

const ExpenseFilters = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.expenses);
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce search input before updating filters and refetching
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
    dispatch(setFilters(updates.page ? updates : { ...updates, page: 1 }));
    dispatch(fetchExpenses(nextFilters));
  };

  const handleClear = () => {
    setSearchInput("");
    dispatch(resetFilters());
    dispatch(fetchExpenses({
      category: "",
      paymentMode: "",
      startDate: "",
      endDate: "",
      search: "",
      page: 1,
      limit: 10,
      sortBy: "date",
    }));
  };

  const hasActiveFilters =
    filters.category ||
    filters.paymentMode ||
    filters.startDate ||
    filters.endDate ||
    filters.search;

  return (
    <div className="card p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs font-medium text-ink-500">
            Search
          </label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-500">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) =>
              applyFilter({ category: e.target.value })
            }
            className={selectClass}
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
          <label className="mb-1 block text-xs font-medium text-ink-500">
            Payment mode
          </label>
          <select
            value={filters.paymentMode}
            onChange={(e) =>
              applyFilter({ paymentMode: e.target.value })
            }
            className={selectClass}
          >
            <option value="">All modes</option>
            {PAYMENT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-500">
            From date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              applyFilter({ startDate: e.target.value })
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-500">
            To date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              applyFilter({ endDate: e.target.value })
            }
            className={inputClass}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleClear}
            className="text-sm font-medium text-brand-600 transition hover:text-brand-700"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpenseFilters;
