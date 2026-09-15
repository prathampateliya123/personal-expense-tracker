import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  formatCurrency,
  formatDate,
} from "../../utils/expenseConstants";
import {
  getCategoryAvatarClass,
  getCategoryChipClass,
  buildCategoryColorMap,
} from "../../utils/categoryColors";
import { INITIAL_TRANSACTION_FILTERS } from "../../services/expenseService";
import categoryService from "../../services/categoryService";
import paymentMethodService from "../../services/paymentMethodService";
import { categoryKeys, paymentMethodKeys } from "../../services/queryKeys";
import { debounce } from "../../utils/helper";
import { DEFAULT_DEBOUNCE_MS } from "../../utils/constants";
import { PencilSquareIcon, TrashIcon } from "../ui/Icons";
import Select from "../ui/Select";
import DateRangePicker from "../ui/DateRangePicker";
import ConfirmModal from "../modal/ConfirmModal";
import TableSearch from "../table/TableSearch";
import TablePager, { TableLimit } from "../table/TablePager";
import NoDataFound from "../ui/NoDataFound";

const COLUMNS = ["Expense", "Category", "Payment", "Date", "Amount", ""];

const TransactionAvatar = ({ category, colorMap }) => (
  <div
    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${getCategoryAvatarClass(
      colorMap?.[category] || category
    )}`}
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
      to={`/expenses/${item._id}/edit`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-accentGreen/30 hover:bg-successBg hover:text-primaryDark"
      aria-label={`Edit ${item.title}`}
      title="Edit"
    >
      <PencilSquareIcon />
    </Link>
    <button
      type="button"
      onClick={() => onDelete(expense)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
      aria-label={`Delete ${item.title}`}
      title="Delete"
    >
      <TrashIcon />
    </button>
  </div>
);

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-border">
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

const TransactionRow = ({ item, onDelete, colorMap, editBasePath }) => (
  <tr className="group border-b border-border transition last:border-0 hover:bg-surfaceLight/70">
    <td className="px-5 py-4">
      <div className="flex min-w-[220px] items-center gap-3">
        <TransactionAvatar category={item.category} colorMap={colorMap} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-textPrimary" title={item.title}>
            {item.title}
          </p>
          {item.description ? (
            <p className="mt-0.5 truncate text-xs text-textSecondary" title={item.description}>
              {item.description}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-textSecondary">{item.paymentMode}</p>
          )}
        </div>
      </div>
    </td>
    <td className="px-5 py-4">
      <span
        className={`category-chip whitespace-nowrap ${getCategoryChipClass(
          colorMap?.[item.category] || item.category
        )}`}
      >
        {item.category}
      </span>
    </td>
    <td className="px-5 py-4">
      <PaymentBadge mode={item.paymentMode} />
    </td>
    <td className="whitespace-nowrap px-5 py-4 text-sm text-textSecondary">
      {formatDate(item.date)}
    </td>
    <td className="whitespace-nowrap px-5 py-4 text-right">
      <span className="text-base font-bold tabular-nums text-textPrimary">
        {formatCurrency(item.amount)}
      </span>
    </td>
    <td className="px-5 py-4">
      <ActionButtons item={item} onDelete={onDelete} editBasePath={editBasePath} />
    </td>
  </tr>
);

const TransactionMobileCard = ({ item, onDelete, colorMap, editBasePath }) => (
  <div className="border-b border-border p-4 last:border-0 hover:bg-surfaceLight/70">
    <div className="flex items-start gap-3">
      <TransactionAvatar category={item.category} colorMap={colorMap} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-textPrimary">{item.title}</p>
            <p className="mt-0.5 text-xs text-textSecondary">
              {formatDate(item.date)} · {item.paymentMode}
            </p>
          </div>
          <p className="shrink-0 text-base font-bold tabular-nums text-textPrimary">
            {formatCurrency(item.amount)}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span
            className={`category-chip ${getCategoryChipClass(
              colorMap?.[item.category] || item.category
            )}`}
          >
            {item.category}
          </span>
          <ActionButtons item={item} onDelete={onDelete} editBasePath={editBasePath} />
        </div>
      </div>
    </div>
  </div>
);

const TransactionTable = ({
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

  const categoriesQuery = useQuery({
    queryKey: categoryKeys.options("expense"),
    queryFn: async () => {
      const data = await categoryService.options("expense");
      return data.categories ?? [];
    },
  });

  const paymentMethodsQuery = useQuery({
    queryKey: paymentMethodKeys.options(),
    queryFn: async () => {
      const data = await paymentMethodService.options();
      return data.paymentMethods ?? [];
    },
  });

  const categoryOptions = (categoriesQuery.data ?? []).map((c) => c.name);
  const paymentOptions = (paymentMethodsQuery.data ?? []).map((p) => p.name);
  const colorMap = useMemo(
    () => buildCategoryColorMap(categoriesQuery.data ?? []),
    [categoriesQuery.data]
  );

  useEffect(() => {
    debounceSearch(searchInput);
    return () => debounceSearch.cancel();
  }, [searchInput, debounceSearch]);

  useEffect(() => {
    if (debouncedSearch === filters.search) return;
    onFiltersChange({ search: debouncedSearch, page: 1 });
  }, [debouncedSearch]); 

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
    onFiltersChange({ ...INITIAL_TRANSACTION_FILTERS });
  };

  const hasActiveFilters =
    filters.category ||
    filters.paymentMode ||
    filters.startDate ||
    filters.endDate ||
    filters.dateOperator ||
    filters.search;

  const handleDeleteClick = (item) => setDeleteTarget(item);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await onDelete(deleteTarget._id);
      setDeleteTarget(null);
    } catch {
      
    }
  };

  const showTableContent = !loading && items.length > 0;
  const showEmpty = !loading && items.length === 0;

  return (
    <>
      <div className="table-panel w-full overflow-hidden">
        <div className="border-b border-border bg-surfaceLight/50 px-3 py-2.5 sm:px-4 sm:py-3">
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
                        options={categoryOptions}
                        size="sm"
                        className="table-toolbar__type"
                      />

                      <Select
                        id="filter-payment"
                        value={filters.paymentMode}
                        onChange={(e) => applyFilter({ paymentMode: e.target.value })}
                        placeholder="Payment"
                        options={paymentOptions}
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
                      operator={filters.dateOperator || null}
                      preset={filters.datePreset || null}
                      showApplyToast={false}
                      onApply={(next) => {
                        applyFilter({
                          dateOperator: next.operator || "",
                          startDate: next.startDate || "",
                          endDate: next.endDate || "",
                          datePreset: next.preset || "",
                        });
                      }}
                      onClear={() => {
                        applyFilter({
                          dateOperator: "",
                          startDate: "",
                          endDate: "",
                          datePreset: "",
                        });
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
                  <tr className="border-b border-border bg-surfaceLight/80">
                    {[columnLabel, "Category", "Payment", "Date", "Amount", ""].map((label) => (
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
          <NoDataFound />
        ) : showTableContent ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-surfaceLight/95 backdrop-blur-sm">
                  <tr className="border-b border-border">
                    {[columnLabel, "Category", "Payment", "Date", "Amount", ""].map((label) => (
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
                <tbody className="divide-y divide-border bg-white">
                  {items.map((expense) => (
                    <TransactionRow
                      key={item._id}
                      item={item}
                      onDelete={handleDeleteClick}
                      colorMap={colorMap}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden">
              {items.map((expense) => (
                <TransactionMobileCard
                  key={item._id}
                  item={item}
                  onDelete={handleDeleteClick}
                  colorMap={colorMap}
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
          entityName={entityName}
          onPageChange={onPageChange}
          disabled={loading}
        />
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteTitle}
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

export default TransactionTable;
