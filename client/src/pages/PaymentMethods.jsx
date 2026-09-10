/**
 * pages/PaymentMethods.jsx
 * Payment method management — backend search + pagination.
 */

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/modal/ConfirmModal";
import TableSearch from "../components/table/TableSearch";
import TablePager, { TableLimit } from "../components/table/TablePager";
import {
  PencilSquareIcon,
  TrashIcon,
  IconPlus,
} from "../components/ui/Icons";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import paymentMethodService, {
  INITIAL_PAYMENT_METHOD_FILTERS,
} from "../services/paymentMethodService";
import { paymentMethodKeys, expenseKeys } from "../services/queryKeys";
import { debounce } from "../utils/helper";
import { DEFAULT_DEBOUNCE_MS } from "../utils/constants";

const emptyForm = { name: "" };

const PaymentMethodFormCard = ({
  title,
  form,
  setForm,
  onSubmit,
  onCancel,
  loading,
  submitLabel,
}) => (
  <form
    onSubmit={onSubmit}
    className="card flex w-full flex-col gap-4 p-5 sm:p-6"
  >
    <h2 className="text-base font-semibold text-textPrimary">{title}</h2>
    <div>
      <label
        htmlFor="payment-method-name"
        className="mb-1.5 block text-sm font-medium text-textPrimary"
      >
        Name
      </label>
      <input
        id="payment-method-name"
        type="text"
        maxLength={40}
        value={form.name}
        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        className="fintech-input"
        placeholder="e.g. Cash, UPI, Card"
        autoFocus
      />
    </div>
    <div className="flex flex-wrap gap-2 sm:justify-end">
      {onCancel ? (
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      ) : null}
      <Button type="submit" loading={loading}>
        {submitLabel}
      </Button>
    </div>
  </form>
);

const PaymentMethods = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ ...INITIAL_PAYMENT_METHOD_FILTERS });
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

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
    setFilters((prev) => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const listQuery = useQuery({
    queryKey: paymentMethodKeys.list(filters),
    queryFn: () => paymentMethodService.list(filters),
    placeholderData: (previous) => previous,
  });

  const paymentMethods = listQuery.data?.paymentMethods ?? [];
  const totalCount = listQuery.data?.totalCount ?? 0;
  const totalPages = listQuery.data?.totalPages ?? 1;
  const currentPage = listQuery.data?.currentPage ?? filters.page;
  const loading = listQuery.isLoading || listQuery.isFetching;

  const invalidateRelated = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.all }),
      queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: (payload) => paymentMethodService.create(payload),
    onSuccess: async () => {
      showSuccessToast("Payment method created");
      setForm(emptyForm);
      setShowAdd(false);
      setSearchInput("");
      setDebouncedSearch("");
      setFilters({ ...INITIAL_PAYMENT_METHOD_FILTERS });
      await invalidateRelated();
    },
    onError: handleApiError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => paymentMethodService.update(id, payload),
    onSuccess: async () => {
      showSuccessToast("Payment method updated");
      setEditing(null);
      setForm(emptyForm);
      await invalidateRelated();
    },
    onError: handleApiError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => paymentMethodService.remove(id),
    onSuccess: async () => {
      showSuccessToast("Payment method deleted");
      setDeleteTarget(null);
      await invalidateRelated();
    },
    onError: handleApiError,
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      handleApiError({ message: "Payment method name is required" });
      return;
    }
    createMutation.mutate({ name });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editing) return;
    const name = form.name.trim();
    if (!name) {
      handleApiError({ message: "Payment method name is required" });
      return;
    }
    updateMutation.mutate({ id: editing._id, payload: { name } });
  };

  const startEdit = (item) => {
    setShowAdd(false);
    setEditing(item);
    setForm({ name: item.name });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const applyFilter = (updates) => {
    setFilters((prev) => ({ ...prev, ...updates, page: 1 }));
  };

  const handleClear = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setFilters({ ...INITIAL_PAYMENT_METHOD_FILTERS });
  };

  const hasActiveFilters = Boolean(filters.search);

  const requestDelete = (item) => {
    if ((item.expenseCount ?? 0) > 0) {
      handleApiError({
        message: `Cannot delete "${item.name}" — ${item.expenseCount} expense${
          item.expenseCount === 1 ? "" : "s"
        } still use it.`,
      });
      return;
    }
    setDeleteTarget(item);
  };

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
            Payment methods
          </h1>
          <p className="mt-1 text-sm text-textSecondary">
            Manage how you pay — Cash, UPI, Card, and more
          </p>
        </div>
        {!showAdd && !editing ? (
          <Button
            type="button"
            className="self-start sm:self-auto"
            onClick={() => {
              setShowAdd(true);
              setForm(emptyForm);
            }}
          >
            <IconPlus className="h-4 w-4" />
            Add payment method
          </Button>
        ) : null}
      </div>

      {showAdd ? (
        <PaymentMethodFormCard
          title="New payment method"
          form={form}
          setForm={setForm}
          onSubmit={handleCreate}
          onCancel={() => {
            setShowAdd(false);
            setForm(emptyForm);
          }}
          loading={createMutation.isPending}
          submitLabel="Create payment method"
        />
      ) : null}

      {editing ? (
        <PaymentMethodFormCard
          title={`Edit “${editing.name}”`}
          form={form}
          setForm={setForm}
          onSubmit={handleUpdate}
          onCancel={cancelEdit}
          loading={updateMutation.isPending}
          submitLabel="Save changes"
        />
      ) : null}

      <div className="table-panel w-full overflow-hidden">
        <div className="border-b border-border bg-surfaceLight/50 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="table-toolbar">
            <div className="table-toolbar__row">
              <div className="table-toolbar__search">
                <div className="table-toolbar__search-field">
                  <TableSearch
                    value={searchInput}
                    onChange={setSearchInput}
                    placeholder="Search payment methods..."
                  />
                </div>
              </div>

              <div className="table-toolbar__controls">
                <div className="table-toolbar__control-row">
                  <div className="table-toolbar__tools-wrap">
                    <div className="table-toolbar__tools table-toolbar__controls-start">
                      <TableLimit
                        value={filters.limit}
                        onChange={(limit) => applyFilter({ limit })}
                      />

                      {hasActiveFilters ? (
                        <button
                          type="button"
                          onClick={handleClear}
                          className="shrink-0 text-sm font-medium text-accentGreen hover:text-primaryMid"
                        >
                          Clear
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading && paymentMethods.length === 0 ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-surfaceGray"
              />
            ))}
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h3 className="text-lg font-semibold text-textPrimary">
              {hasActiveFilters
                ? "No payment methods found"
                : "No payment methods yet"}
            </h3>
            <p className="mt-1 text-sm text-textSecondary">
              {hasActiveFilters
                ? "Try adjusting your search."
                : "Add Cash, UPI, Card, or any method you use."}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-b border-border bg-surfaceLight/60 text-xs font-semibold uppercase tracking-wide text-textSecondary">
                    <th className="px-5 py-3">Payment method</th>
                    <th className="px-5 py-3">Expenses</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentMethods.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-border last:border-0 hover:bg-surfaceLight/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surfaceGray text-sm font-bold text-textPrimary">
                            {item.name?.[0] || "?"}
                          </div>
                          <p className="font-semibold text-textPrimary">
                            {item.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-textSecondary">
                        {item.expenseCount ?? 0}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-accentGreen/30 hover:bg-successBg hover:text-primaryDark"
                            aria-label={`Edit ${item.name}`}
                          >
                            <PencilSquareIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDelete(item)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                            aria-label={`Delete ${item.name}`}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border md:hidden">
              {paymentMethods.map((item) => (
                <div key={item._id} className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surfaceGray text-sm font-bold text-textPrimary">
                    {item.name?.[0] || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-textPrimary">
                      {item.name}
                    </p>
                    <p className="text-xs text-textSecondary">
                      {item.expenseCount ?? 0} expense
                      {(item.expenseCount ?? 0) === 1 ? "" : "s"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-textSecondary"
                    aria-label={`Edit ${item.name}`}
                  >
                    <PencilSquareIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => requestDelete(item)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-textSecondary"
                    aria-label={`Delete ${item.name}`}
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <TablePager
          page={currentPage}
          totalPages={totalPages}
          totalRecords={totalCount}
          pageSize={filters.limit}
          entityName="payment methods"
          disabled={loading || deleteMutation.isPending}
          onPageChange={(page) => {
            if (page < 1 || page > totalPages) return;
            setFilters((prev) => ({ ...prev, page }));
          }}
        />
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete payment method?"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        danger
        confirming={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget._id);
        }}
      />
    </div>
  );
};

export default PaymentMethods;
