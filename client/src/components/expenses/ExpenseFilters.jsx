/**
 * components/expenses/ExpenseFilters.jsx
 * Filter bar with debounced search — controlled by parent page.
 */

import { useEffect, useMemo, useState } from "react";
import { EXPENSE_CATEGORIES, PAYMENT_MODES } from "../../utils/expenseConstants";
import { INITIAL_EXPENSE_FILTERS } from "../../services/expenseService";
import { debounce } from "../../utils/helper";
import { DEFAULT_DEBOUNCE_MS } from "../../utils/constants";
import Select from "../ui/Select";
import DateInput from "../ui/DateInput";

const labelClass = "mb-1 block text-xs font-medium text-textSecondary";

const ExpenseFilters = ({ filters, onFiltersChange }) => {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const debounceSearch = useMemo(
    () => debounce(setDebouncedSearch, DEFAULT_DEBOUNCE_MS),
    []
  );

  useEffect(() => {
    debounceSearch(searchInput);
    return () => debounceSearch.cancel();
  }, [searchInput, debounceSearch]);

  useEffect(() => {
    if (debouncedSearch === filters.search) return;
    onFiltersChange({ search: debouncedSearch, page: 1 });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setSearchInput(filters.search);
    setDebouncedSearch(filters.search);
  }, [filters.search]);

  const applyFilter = (updates) => {
    onFiltersChange({ ...updates, page: 1 });
  };

  const handleClear = () => {
    setSearchInput("");
    setDebouncedSearch("");
    onFiltersChange({ ...INITIAL_EXPENSE_FILTERS });
  };

  const hasActiveFilters =
    filters.category ||
    filters.paymentMode ||
    filters.startDate ||
    filters.endDate ||
    filters.search;

  return (
    <div className="card w-full p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-textPrimary">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm font-medium text-accentGreen hover:text-primaryMid"
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
            className="fintech-input"
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

        <DateInput
          id="filter-start-date"
          label="From date"
          labelClassName={labelClass}
          value={filters.startDate}
          onChange={(e) => applyFilter({ startDate: e.target.value })}
          size="sm"
        />

        <DateInput
          id="filter-end-date"
          label="To date"
          labelClassName={labelClass}
          value={filters.endDate}
          onChange={(e) => applyFilter({ endDate: e.target.value })}
          size="sm"
          min={filters.startDate || undefined}
        />
      </div>
    </div>
  );
};

export default ExpenseFilters;
