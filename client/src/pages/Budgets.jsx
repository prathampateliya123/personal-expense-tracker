/**
 * pages/Budgets.jsx
 * Monthly budget planning — overall limit + per-category allocations + progress.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/modal/ConfirmModal";
import CircularProgress from "../components/dashboard/CircularProgress";
import NoDataFound from "../components/ui/NoDataFound";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  TrashIcon,
} from "../components/ui/Icons";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import budgetService, {
  formatPeriodLabel,
  getCurrentPeriod,
  shiftPeriod,
} from "../services/budgetService";
import categoryService from "../services/categoryService";
import { budgetKeys, categoryKeys } from "../services/queryKeys";
import { formatCurrency } from "../utils/expenseConstants";
import {
  buildCategoryColorMap,
  getCategoryAvatarClass,
  getCategoryChipClass,
} from "../utils/categoryColors";

const ProgressBar = ({ percent = 0, over = false }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-surfaceGray">
    <div
      className={`h-full rounded-full transition-all ${
        over ? "bg-red-500" : "bg-accentGreen"
      }`}
      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
    />
  </div>
);

const StatCard = ({ label, value, hint, danger = false }) => (
  <div className="card flex min-h-[96px] flex-col justify-center p-5">
    <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">
      {label}
    </p>
    <p
      className={`mt-1 text-2xl font-bold sm:text-3xl ${
        danger ? "text-red-500" : "text-primaryDark"
      }`}
    >
      {value}
    </p>
    {hint ? <p className="mt-1 text-xs text-textSecondary">{hint}</p> : null}
  </div>
);

const Budgets = () => {
  const queryClient = useQueryClient();
  const initial = getCurrentPeriod();
  const [period, setPeriod] = useState(initial);
  const [totalAmount, setTotalAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [allocationDraft, setAllocationDraft] = useState({});
  const [deleteOpen, setDeleteOpen] = useState(false);

  const periodLabel = formatPeriodLabel(period.year, period.month);

  const budgetQuery = useQuery({
    queryKey: budgetKeys.current(period.year, period.month),
    queryFn: () => budgetService.current(period),
  });

  const categoriesQuery = useQuery({
    queryKey: categoryKeys.options("expense"),
    queryFn: async () => {
      const data = await categoryService.options("expense");
      return data.categories ?? [];
    },
  });

  const categories = categoriesQuery.data ?? [];
  const colorMap = useMemo(
    () => buildCategoryColorMap(categories),
    [categories]
  );

  const budget = budgetQuery.data?.budget;
  const progress = budgetQuery.data?.progress;

  useEffect(() => {
    if (!budgetQuery.data) return;
    const nextBudget = budgetQuery.data.budget;
    setTotalAmount(
      nextBudget?.totalAmount != null ? String(nextBudget.totalAmount) : ""
    );
    setNotes(nextBudget?.notes || "");

    const draft = {};
    for (const cat of categories) {
      draft[cat.name] = "";
    }
    for (const row of nextBudget?.allocations || []) {
      draft[row.category] = String(row.amount ?? "");
    }
    setAllocationDraft(draft);
  }, [budgetQuery.data, categories]);

  const invalidateBudgets = async () => {
    await queryClient.invalidateQueries({ queryKey: budgetKeys.all });
  };

  const saveMutation = useMutation({
    mutationFn: (payload) => budgetService.upsert(payload),
    onSuccess: async () => {
      showSuccessToast("Budget saved");
      await invalidateBudgets();
    },
    onError: handleApiError,
  });

  const copyMutation = useMutation({
    mutationFn: () =>
      budgetService.copy({ year: period.year, month: period.month }),
    onSuccess: async () => {
      showSuccessToast("Budget copied from previous month");
      await invalidateBudgets();
    },
    onError: handleApiError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => budgetService.remove(id),
    onSuccess: async () => {
      showSuccessToast("Budget deleted");
      setDeleteOpen(false);
      await invalidateBudgets();
    },
    onError: handleApiError,
  });

  const allocatedTotal = useMemo(
    () =>
      Object.values(allocationDraft).reduce((sum, value) => {
        const num = Number(value);
        return sum + (!Number.isNaN(num) && num > 0 ? num : 0);
      }, 0),
    [allocationDraft]
  );

  const handleSave = (e) => {
    e.preventDefault();
    const amount = Number(totalAmount);
    if (!totalAmount || Number.isNaN(amount) || amount <= 0) {
      handleApiError({ message: "Enter a valid total budget amount" });
      return;
    }

    const allocations = Object.entries(allocationDraft)
      .map(([category, value]) => ({
        category,
        amount: Number(value),
      }))
      .filter((row) => !Number.isNaN(row.amount) && row.amount > 0);

    if (allocatedTotal > amount) {
      handleApiError({
        message: "Category allocations cannot exceed the total budget",
      });
      return;
    }

    saveMutation.mutate({
      year: period.year,
      month: period.month,
      totalAmount: amount,
      notes: notes.trim(),
      allocations,
    });
  };

  const loading = budgetQuery.isLoading || categoriesQuery.isLoading;
  const saving = saveMutation.isPending || copyMutation.isPending;

  const allocationRows = useMemo(() => {
    const progressMap = Object.fromEntries(
      (progress?.allocations || []).map((row) => [row.category, row])
    );
    const spentMap = Object.fromEntries(
      (progress?.byCategory || []).map((row) => [row.category, row])
    );

    return categories.map((cat) => {
      const progressRow = progressMap[cat.name];
      const spentRow = spentMap[cat.name];
      return {
        category: cat.name,
        color: cat.color,
        amount: Number(allocationDraft[cat.name]) || 0,
        spent: progressRow?.spent ?? spentRow?.spent ?? 0,
        percentUsed: progressRow?.percentUsed ?? 0,
        overBudget: progressRow?.overBudget ?? false,
      };
    });
  }, [categories, allocationDraft, progress]);

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
            Budget planning
          </h1>
          <p className="mt-1 text-sm text-textSecondary">
            Set a monthly limit and allocate spend by category
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPeriod((prev) => shiftPeriod(prev.year, prev.month, -1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:bg-surfaceGray"
            aria-label="Previous month"
          >
            <IconChevronLeft />
          </button>
          <div className="min-w-[10rem] text-center text-sm font-semibold text-textPrimary">
            {periodLabel}
          </div>
          <button
            type="button"
            onClick={() => setPeriod((prev) => shiftPeriod(prev.year, prev.month, 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:bg-surfaceGray"
            aria-label="Next month"
          >
            <IconChevronRight />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-surfaceGray" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Monthly budget"
              value={formatCurrency(progress?.totalAmount || Number(totalAmount) || 0)}
              hint={budget ? "Saved plan" : "Not saved yet"}
            />
            <StatCard
              label="Spent"
              value={formatCurrency(progress?.totalSpent || 0)}
              hint={`${progress?.expenseCount || 0} expense${
                (progress?.expenseCount || 0) === 1 ? "" : "s"
              }`}
              danger={Boolean(progress?.overBudget)}
            />
            <StatCard
              label="Remaining"
              value={formatCurrency(progress?.remaining || 0)}
              hint={
                progress?.overBudget ? "Over budget" : "Left for this month"
              }
              danger={Boolean(progress?.overBudget)}
            />
            <StatCard
              label="Allocated"
              value={formatCurrency(allocatedTotal)}
              hint={
                Number(totalAmount) > 0
                  ? `${formatCurrency(
                      Math.max(0, Number(totalAmount) - allocatedTotal)
                    )} unallocated`
                  : "Set total budget first"
              }
            />
          </div>

          <div className="card flex flex-col items-center justify-center gap-3 p-6">
            <CircularProgress
              percent={progress?.percentUsed || 0}
              label={progress?.overBudget ? "Over budget" : "of budget"}
            />
            {!budget ? (
              <p className="text-center text-sm text-textSecondary">
                No budget saved for {periodLabel}
              </p>
            ) : null}
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="card flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-textPrimary">
              Budget details
            </h2>
            <p className="mt-0.5 text-sm text-textSecondary">
              Overall limit for {periodLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!budget ? (
              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={() => copyMutation.mutate()}
              >
                Copy previous month
              </Button>
            ) : null}
            {budget ? (
              <Button
                type="button"
                variant="secondary"
                disabled={saving || deleteMutation.isPending}
                onClick={() => setDeleteOpen(true)}
              >
                <TrashIcon />
                Delete
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="budget-total"
              className="mb-1.5 block text-sm font-medium text-textPrimary"
            >
              Total budget (₹)
            </label>
            <input
              id="budget-total"
              type="number"
              min="0"
              step="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="fintech-input"
              placeholder="e.g. 25000"
            />
          </div>
          <div>
            <label
              htmlFor="budget-notes"
              className="mb-1.5 block text-sm font-medium text-textPrimary"
            >
              Notes (optional)
            </label>
            <input
              id="budget-notes"
              type="text"
              maxLength={300}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="fintech-input"
              placeholder="e.g. Tight month — cut shopping"
            />
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-textPrimary">
                Category allocations
              </h3>
              <p className="text-xs text-textSecondary">
                Optional limits per expense category
              </p>
            </div>
            {categories.length === 0 ? (
              <Link
                to="/categories"
                className="inline-flex items-center gap-1 text-sm font-medium text-accentGreen hover:text-primaryMid"
              >
                <IconPlus className="h-4 w-4" />
                Add expense categories
              </Link>
            ) : null}
          </div>

          {categories.length === 0 ? (
            <NoDataFound className="py-10" />
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="hidden md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surfaceLight/60 text-xs font-semibold uppercase tracking-wide text-textSecondary">
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Budget</th>
                      <th className="px-4 py-3">Spent</th>
                      <th className="px-4 py-3">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocationRows.map((row) => (
                      <tr
                        key={row.category}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${getCategoryAvatarClass(
                                colorMap[row.category] || row
                              )}`}
                            >
                              {row.category?.[0] || "?"}
                            </div>
                            <span
                              className={`category-chip ${getCategoryChipClass(
                                colorMap[row.category] || row
                              )}`}
                            >
                              {row.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={allocationDraft[row.category] ?? ""}
                            onChange={(e) =>
                              setAllocationDraft((prev) => ({
                                ...prev,
                                [row.category]: e.target.value,
                              }))
                            }
                            className="fintech-input max-w-[140px]"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-textPrimary">
                          {formatCurrency(row.spent)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="min-w-[120px] space-y-1">
                            <ProgressBar
                              percent={
                                row.amount > 0
                                  ? Math.round((row.spent / row.amount) * 100)
                                  : 0
                              }
                              over={row.amount > 0 && row.spent > row.amount}
                            />
                            <p className="text-xs text-textSecondary">
                              {row.amount > 0
                                ? `${Math.min(
                                    100,
                                    Math.round((row.spent / row.amount) * 100)
                                  )}%`
                                : "No limit"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-border md:hidden">
                {allocationRows.map((row) => (
                  <div key={row.category} className="space-y-3 p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${getCategoryAvatarClass(
                          colorMap[row.category] || row
                        )}`}
                      >
                        {row.category?.[0] || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-textPrimary">
                          {row.category}
                        </p>
                        <p className="text-xs text-textSecondary">
                          Spent {formatCurrency(row.spent)}
                        </p>
                      </div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={allocationDraft[row.category] ?? ""}
                      onChange={(e) =>
                        setAllocationDraft((prev) => ({
                          ...prev,
                          [row.category]: e.target.value,
                        }))
                      }
                      className="fintech-input"
                      placeholder="Budget amount"
                    />
                    <ProgressBar
                      percent={
                        row.amount > 0
                          ? Math.round((row.spent / row.amount) * 100)
                          : 0
                      }
                      over={row.amount > 0 && row.spent > row.amount}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-border pt-5">
          <Button type="submit" loading={saveMutation.isPending}>
            Save budget
          </Button>
        </div>
      </form>

      <ConfirmModal
        open={deleteOpen}
        title="Delete budget?"
        description={`Delete the budget plan for ${periodLabel}? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        confirming={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteOpen(false);
        }}
        onConfirm={() => {
          if (!budget?._id) return;
          deleteMutation.mutate(budget._id);
        }}
      />
    </div>
  );
};

export default Budgets;
