import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/modal/ConfirmModal";
import PaymentMethodFormCard from "../components/paymentMethods/PaymentMethodFormCard";
import PaymentMethodList from "../components/paymentMethods/PaymentMethodList";
import { IconPlus } from "../components/ui/Icons";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import paymentMethodService, {
  INITIAL_PAYMENT_METHOD_FILTERS,
} from "../services/paymentMethodService";
import { paymentMethodKeys, expenseKeys } from "../services/queryKeys";
import { debounce } from "../utils/helper";
import { DEFAULT_DEBOUNCE_MS } from "../utils/constants";

const emptyForm = { name: "" };

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
  }, [debouncedSearch]); 

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

      <PaymentMethodList
        paymentMethods={paymentMethods}
        loading={loading}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onApplyFilter={applyFilter}
        onClear={handleClear}
        onEdit={startEdit}
        onDelete={requestDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pagerDisabled={loading || deleteMutation.isPending}
        onPageChange={(page) => {
          if (page < 1 || page > totalPages) return;
          setFilters((prev) => ({ ...prev, page }));
        }}
      />

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
