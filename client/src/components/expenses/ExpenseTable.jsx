/**
 * components/expenses/ExpenseTable.jsx
 * Unified table panel — toolbar (filters), table body, and pagination in one card.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CATEGORY_COLORS,
  CATEGORY_AVATAR_BG,
  EXPENSE_CATEGORIES,
  PAYMENT_MODES,
  formatCurrency,
  formatExpenseDate,
} from "../../utils/expenseConstants";
import { INITIAL_EXPENSE_FILTERS } from "../../services/expenseService";
import { debounce } from "../../utils/helper";
import { DEFAULT_DEBOUNCE_MS } from "../../utils/constants";
import { PencilSquareIcon, TrashIcon } from "../ui/Icons";
import Select from "../ui/Select";
import DateRangePicker from "../ui/DateRangePicker";
import ConfirmModal from "../modal/ConfirmModal";
import TableSearch from "../table/TableSearch";
import TablePager, { TableLimit } from "../table/TablePager";

const COLUMNS = ["Expense", "Category", "Payment", "Date", "Amount", ""];

const ExpenseAvatar = ({ category }) => (
  <div
    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
      CATEGORY_AVATAR_BG[category] || CATEGORY_AVATAR_BG.Other
    }`}
  >
    {category?.[0] || "₹"}
  </div>
);

const PaymentBadge = ({ mode }) => (
  <span className="inline-flex rounded-lg bg-surfaceGray px-2.5 py-1 text-xs font-medium text-textSecondary">
    {mode}
  </span>
);

const ActionButtons = ({ expense, onDelete }) => (
  <div className="flex items-center justify-end gap-1.5">
    <Link
      to={`/expenses/${expense._id}/edit`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-accentGreen/30 hover:bg-successBg hover:text-primaryDark"
      aria-label={`Edit ${expense.title}`}
      title="Edit"
    >
      <PencilSquareIcon />
    </Link>
    <button
      type="button"
      onClick={() => onDelete(expense)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
      aria-label={`Delete ${expense.title}`}
      title="Delete"
    >
      <TrashIcon />
    </button>
  </div>
);

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-border/40">
    <td className="px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-surfaceGray" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded-lg bg-surfaceGray" />
          <div className="h-3 w-24 rounded-lg bg-surfaceGray" />
        </div>
      </div>
    </td>
    {[1, 2, 3, 4].map((col) => (
      <td key={col} className="px-5 py-4">
        <div className="h-4 rounded-lg bg-surfaceGray" />
      </td>
    ))}
    <td className="px-5 py-4">
      <div className="ml-auto h-9 w-20 rounded-lg bg-surfaceGray" />
    </td>
  </tr>
);

const ExpenseRow = ({ expense, onDelete }) => (
  <tr className="group border-b border-border/40 transition last:border-0 hover:bg-surfaceLight/70">
    <td className="px-5 py-4">
      <div className="flex min-w-[220px] items-center gap-3">
        <ExpenseAvatar category={expense.category} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-textPrimary" title={expense.title}>
            {expense.title}
          </p>
          {expense.description ? (
            <p className="mt-0.5 truncate text-xs text-textSecondary" title={expense.description}>
              {expense.description}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-textSecondary">{expense.paymentMode}</p>
          )}
        </div>
      </div>
    </td>
    <td className="px-5 py-4">
      <span className={`category-chip whitespace-nowrap ${CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other}`}>
        {expense.category}
      </span>
    </td>
    <td className="px-5 py-4">
      <PaymentBadge mode={expense.paymentMode} />
    </td>
    <td className="whitespace-nowrap px-5 py-4 text-sm text-textSecondary">
      {formatExpenseDate(expense.date)}
    </td>
    <td className="whitespace-nowrap px-5 py-4 text-right">
      <span className="text-base font-bold tabular-nums text-textPrimary">
        {formatCurrency(expense.amount)}
      </span>
    </td>
    <td className="px-5 py-4">
      <ActionButtons expense={expense} onDelete={onDelete} />
    </td>
  </tr>
);

const ExpenseMobileCard = ({ expense, onDelete }) => (
  <div className="border-b border-border/40 p-4 last:border-0 hover:bg-surfaceLight/70">
    <div className="flex items-start gap-3">
      <ExpenseAvatar category={expense.category} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-textPrimary">{expense.title}</p>
            <p className="mt-0.5 text-xs text-textSecondary">
              {formatExpenseDate(expense.date)} · {expense.paymentMode}
            </p>
          </div>
          <p className="shrink-0 text-base font-bold tabular-nums text-textPrimary">
            {formatCurrency(expense.amount)}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className={`category-chip ${CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other}`}>
            {expense.category}
          </span>
          <ActionButtons expense={expense} onDelete={onDelete} />
        </div>
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-successBg text-2xl">
      ₹
    </div>
    <h3 className="text-lg font-semibold text-textPrimary">No expenses found</h3>
    <p className="mt-1 max-w-sm text-sm text-textSecondary">
      Try adjusting your filters or add your first expense to get started.
    </p>
  </div>
);

const ExpenseTable = ({
  filters,
  onFiltersChange,
  expenses,
  loading,
  totalCount,
  totalPages,
  currentPage,
  onPageChange,
  onDelete,
  deleting = false,
}) => {
  const [deleteTarget, setDeleteTarget] = useState(null);
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

  const handleDeleteClick = (expense) => setDeleteTarget(expense);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await onDelete(deleteTarget._id);
      setDeleteTarget(null);
    } catch {
      /* keep dialog open */
    }
  };

  const showTableContent = !loading && expenses.length > 0;
  const showEmpty = !loading && expenses.length === 0;

  return (
    <>
      <div className="table-panel card w-full overflow-hidden">
        <div className="border-b border-border/60 bg-surfaceLight/50 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="table-toolbar">
            <div className="table-toolbar__row">
              <div className="table-toolbar__search">
                <div className="table-toolbar__search-field">
                  <TableSearch
                    value={searchInput}
                    onChange={setSearchInput}
                  />
                </div>
              </div>

              <div className="table-toolbar__controls">
                <div className="table-toolbar__control-row">
                  <div className="table-toolbar__tools-wrap">
                    <div className="table-toolbar__tools table-toolbar__controls-start">
                      <Select
                        id="filter-category"
                        value={filters.category}
                        onChange={(e) => applyFilter({ category: e.target.value })}
                        placeholder="Category"
                        options={EXPENSE_CATEGORIES}
                        size="sm"
                        className="table-toolbar__type"
                      />

                      <Select
                        id="filter-payment"
                        value={filters.paymentMode}
                        onChange={(e) => applyFilter({ paymentMode: e.target.value })}
                        placeholder="Payment"
                        options={PAYMENT_MODES}
                        size="sm"
                        className="table-toolbar__type"
                      />

                      <TableLimit
                        value={filters.limit}
                        onChange={(limit) => applyFilter({ limit })}
                      />

                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={handleClear}
                          className="shrink-0 text-sm font-medium text-accentGreen hover:text-primaryMid"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="table-toolbar__date">
                    <DateRangePicker
                      className="w-full"
                      startDate={filters.startDate || null}
                      endDate={filters.endDate || null}
                      operator="between"
                      hideOperatorSelect
                      preferDateRangeLabel
                      showApplyToast={false}
                      onApply={(next) => {
                        applyFilter({
                          startDate: next.startDate || "",
                          endDate: next.endDate || "",
                        });
                      }}
                      onClear={() => {
                        applyFilter({ startDate: "", endDate: "" });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-surfaceLight/80">
                    {COLUMNS.map((label) => (
                      <th
                        key={label || "actions"}
                        className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-textSecondary"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((row) => (
                    <SkeletonRow key={row} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 p-4 md:hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-surfaceGray" />
              ))}
            </div>
          </>
        ) : showEmpty ? (
          <EmptyState />
        ) : showTableContent ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-surfaceLight/95 backdrop-blur-sm">
                  <tr className="border-b border-border/60">
                    {COLUMNS.map((label) => (
                      <th
                        key={label || "actions"}
                        className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-textSecondary ${
                          label === "Amount" ? "text-right" : ""
                        } ${label === "" ? "text-right" : ""}`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 bg-white">
                  {expenses.map((expense) => (
                    <ExpenseRow
                      key={expense._id}
                      expense={expense}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden">
              {expenses.map((expense) => (
                <ExpenseMobileCard
                  key={expense._id}
                  expense={expense}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          </>
        ) : null}

        <TablePager
          page={currentPage}
          totalPages={totalPages}
          totalRecords={totalCount}
          pageSize={filters.limit}
          entityName="expenses"
          onPageChange={onPageChange}
          disabled={loading}
        />
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete expense?"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        confirming={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
      />
    </>
  );
};

export default ExpenseTable;
