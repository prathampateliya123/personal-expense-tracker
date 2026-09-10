/**
 * pages/Categories.jsx
 * Category management — list, create, edit, delete.
 */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/modal/ConfirmModal";
import {
  PencilSquareIcon,
  TrashIcon,
  IconPlus,
} from "../components/ui/Icons";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import categoryService from "../services/categoryService";
import { categoryKeys, expenseKeys } from "../services/queryKeys";
import {
  CATEGORY_COLOR_OPTIONS,
  getCategoryAvatarClass,
  getCategoryChipClass,
  getCategoryColorMeta,
} from "../utils/categoryColors";

const emptyForm = { name: "", color: "slate" };

const ColorPicker = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {CATEGORY_COLOR_OPTIONS.map((opt) => {
      const selected = value === opt.key;
      return (
        <button
          key={opt.key}
          type="button"
          title={opt.label}
          onClick={() => onChange(opt.key)}
          className={`h-8 w-8 rounded-lg border-2 transition ${opt.swatch} ${
            selected
              ? "border-primaryDark ring-2 ring-accentGreen/40"
              : "border-transparent hover:scale-105"
          }`}
          aria-label={opt.label}
          aria-pressed={selected}
        />
      );
    })}
  </div>
);

const CategoryFormCard = ({
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
      <label htmlFor="category-name" className="mb-1.5 block text-sm font-medium text-textPrimary">
        Name
      </label>
      <input
        id="category-name"
        type="text"
        maxLength={40}
        value={form.name}
        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        className="fintech-input"
        placeholder="e.g. Groceries"
        autoFocus
      />
    </div>
    <div>
      <p className="mb-1.5 text-sm font-medium text-textPrimary">Color</p>
      <ColorPicker
        value={form.color}
        onChange={(color) => setForm((prev) => ({ ...prev, color }))}
      />
    </div>
    <div className="flex flex-wrap gap-2 sm:justify-end">
      {onCancel ? (
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      ) : null}
      <Button type="submit" loading={loading}>
        {submitLabel}
      </Button>
    </div>
  </form>
);

const Categories = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const listQuery = useQuery({
    queryKey: categoryKeys.list(),
    queryFn: async () => {
      const data = await categoryService.list();
      return data.categories ?? [];
    },
  });

  const categories = listQuery.data ?? [];

  const invalidateRelated = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
      queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: (payload) => categoryService.create(payload),
    onSuccess: async () => {
      showSuccessToast("Category created");
      setForm(emptyForm);
      setShowAdd(false);
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
    createMutation.mutate({ name, color: form.color });
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

  const loading = listQuery.isLoading;

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
            Categories
          </h1>
          <p className="mt-1 text-sm text-textSecondary">
            Create and manage categories for your expenses
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

      {showAdd ? (
        <CategoryFormCard
          title="New category"
          form={form}
          setForm={setForm}
          onSubmit={handleCreate}
          onCancel={() => {
            setShowAdd(false);
            setForm(emptyForm);
          }}
          loading={createMutation.isPending}
          submitLabel="Create category"
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
        />
      ) : null}

      <div className="table-panel card w-full overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-surfaceGray" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h3 className="text-lg font-semibold text-textPrimary">No categories yet</h3>
            <p className="mt-1 text-sm text-textSecondary">
              Add your first category to start organizing expenses.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-border bg-surfaceLight/60 text-xs font-semibold uppercase tracking-wide text-textSecondary">
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Color</th>
                    <th className="px-5 py-3">Expenses</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category._id}
                      className="border-b border-border/40 last:border-0 hover:bg-surfaceLight/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${getCategoryAvatarClass(category)}`}
                          >
                            {category.name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-textPrimary">{category.name}</p>
                            {category.isDefault ? (
                              <p className="text-xs text-textSecondary">Default</p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`category-chip ${getCategoryChipClass(category)}`}>
                          {getCategoryColorMeta(category.color).label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-textSecondary">
                        {category.expenseCount ?? 0}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(category)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-accentGreen/30 hover:bg-successBg hover:text-primaryDark"
                            aria-label={`Edit ${category.name}`}
                          >
                            <PencilSquareIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if ((category.expenseCount ?? 0) > 0) {
                                handleApiError({
                                  message: `Cannot delete "${category.name}" — ${category.expenseCount} expense${
                                    category.expenseCount === 1 ? "" : "s"
                                  } still use it.`,
                                });
                                return;
                              }
                              setDeleteTarget(category);
                            }}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                            aria-label={`Delete ${category.name}`}
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

            <div className="divide-y divide-border/40 md:hidden">
              {categories.map((category) => (
                <div key={category._id} className="flex items-center gap-3 p-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${getCategoryAvatarClass(category)}`}
                  >
                    {category.name?.[0] || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-textPrimary">{category.name}</p>
                    <p className="text-xs text-textSecondary">
                      {category.expenseCount ?? 0} expense
                      {(category.expenseCount ?? 0) === 1 ? "" : "s"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(category)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-textSecondary"
                    aria-label={`Edit ${category.name}`}
                  >
                    <PencilSquareIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if ((category.expenseCount ?? 0) > 0) {
                        handleApiError({
                          message: `Cannot delete "${category.name}" — ${category.expenseCount} expense${
                            category.expenseCount === 1 ? "" : "s"
                          } still use it.`,
                        });
                        return;
                      }
                      setDeleteTarget(category);
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-textSecondary"
                    aria-label={`Delete ${category.name}`}
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

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
