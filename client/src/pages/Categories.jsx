import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/modal/ConfirmModal";
import CategoryFormCard from "../components/categories/CategoryFormCard";
import CategoryList from "../components/categories/CategoryList";
import { IconPlus } from "../components/ui/Icons";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import categoryService, {
  INITIAL_CATEGORY_FILTERS,
} from "../services/categoryService";
import { categoryKeys, expenseKeys, incomeKeys } from "../services/queryKeys";
import { CATEGORY_COLOR_OPTIONS } from "../utils/categoryColors";
import { debounce } from "../utils/helper";
import { DEFAULT_DEBOUNCE_MS } from "../utils/constants";

const emptyForm = { name: "", color: "slate" };

const TYPE_TABS = [
  { key: "expense", label: "Expense" },
  { key: "income", label: "Income" },
];

const Categories = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ ...INITIAL_CATEGORY_FILTERS });
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
    queryKey: categoryKeys.list(filters),
    queryFn: () => categoryService.list(filters),
    placeholderData: (previous) => previous,
  });

  const categories = listQuery.data?.categories ?? [];
  const totalCount = listQuery.data?.totalCount ?? 0;
  const totalPages = listQuery.data?.totalPages ?? 1;
  const currentPage = listQuery.data?.currentPage ?? filters.page;
  const loading = listQuery.isLoading || listQuery.isFetching;

  const invalidateRelated = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
      queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
      queryClient.invalidateQueries({ queryKey: incomeKeys.all }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: (payload) => categoryService.create(payload),
    onSuccess: async () => {
      showSuccessToast("Category created");
      setForm(emptyForm);
      setShowAdd(false);
      setSearchInput("");
      setDebouncedSearch("");
      setFilters((prev) => ({
        ...INITIAL_CATEGORY_FILTERS,
        type: prev.type || "expense",
      }));
      await invalidateRelated();
    },
    onError: handleApiError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => categoryService.update(id, payload),
    onSuccess: async () => {
      showSuccessToast("Category updated");
      setEditing(null);
      setForm(emptyForm);
      await invalidateRelated();
    },
    onError: handleApiError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryService.remove(id),
    onSuccess: async () => {
      showSuccessToast("Category deleted");
      setDeleteTarget(null);
      await invalidateRelated();
    },
    onError: handleApiError,
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      handleApiError({ message: "Category name is required" });
      return;
    }
    createMutation.mutate({
      name,
      color: form.color,
      type: filters.type || "expense",
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editing) return;
    const name = form.name.trim();
    if (!name) {
      handleApiError({ message: "Category name is required" });
      return;
    }
    updateMutation.mutate({
      id: editing._id,
      payload: { name, color: form.color },
    });
  };

  const startEdit = (category) => {
    setShowAdd(false);
    setEditing(category);
    setForm({ name: category.name, color: category.color || "slate" });
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
    setFilters((prev) => ({
      ...INITIAL_CATEGORY_FILTERS,
      type: prev.type || "expense",
    }));
  };

  const hasActiveFilters = Boolean(filters.search || filters.color);
  const activeType = filters.type || "expense";
  const usageLabel = activeType === "income" ? "Incomes" : "Expenses";
  const usageWord = activeType === "income" ? "income" : "expense";

  const colorFilterOptions = CATEGORY_COLOR_OPTIONS.map((opt) => ({
    value: opt.key,
    label: opt.label,
  }));

  const requestDelete = (category) => {
    const usage = category.usageCount ?? category.expenseCount ?? 0;
    if (usage > 0) {
      handleApiError({
        message: `Cannot delete "${category.name}" — ${usage} ${usageWord}${
          usage === 1 ? "" : "s"
        } still use it.`,
      });
      return;
    }
    setDeleteTarget(category);
  };

  const switchType = (type) => {
    if (type === filters.type) return;
    setShowAdd(false);
    setEditing(null);
    setForm(emptyForm);
    setSearchInput("");
    setDebouncedSearch("");
    setFilters({ ...INITIAL_CATEGORY_FILTERS, type });
  };

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
            Categories
          </h1>
          <p className="mt-1 text-sm text-textSecondary">
            Create and manage categories for expenses and incomes
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
            Add category
          </Button>
        ) : null}
      </div>

      <div className="flex w-fit gap-1 rounded-lg border border-border bg-surfaceLight p-1">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => switchType(tab.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              activeType === tab.key
                ? "bg-white text-primaryDark shadow-sm"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showAdd ? (
        <CategoryFormCard
          title={`New ${activeType} category`}
          form={form}
          setForm={setForm}
          onSubmit={handleCreate}
          onCancel={() => {
            setShowAdd(false);
            setForm(emptyForm);
          }}
          loading={createMutation.isPending}
          submitLabel="Create category"
          namePlaceholder={
            activeType === "income" ? "e.g. Salary, Freelance" : "e.g. Groceries"
          }
        />
      ) : null}

      {editing ? (
        <CategoryFormCard
          title={`Edit “${editing.name}”`}
          form={form}
          setForm={setForm}
          onSubmit={handleUpdate}
          onCancel={cancelEdit}
          loading={updateMutation.isPending}
          submitLabel="Save changes"
          namePlaceholder={
            activeType === "income" ? "e.g. Salary, Freelance" : "e.g. Groceries"
          }
        />
      ) : null}

      <CategoryList
        categories={categories}
        loading={loading}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        filters={filters}
        colorFilterOptions={colorFilterOptions}
        hasActiveFilters={hasActiveFilters}
        onApplyFilter={applyFilter}
        onClear={handleClear}
        usageLabel={usageLabel}
        usageWord={usageWord}
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
        title="Delete category?"
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

export default Categories;
