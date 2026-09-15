import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ConfirmModal from "../components/modal/ConfirmModal";
import BudgetPeriodHeader from "../components/budgets/BudgetPeriodHeader";
import BudgetStats from "../components/budgets/BudgetStats";
import BudgetForm from "../components/budgets/BudgetForm";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import budgetService, {
  formatPeriodLabel,
  getCurrentPeriod,
  shiftPeriod,
} from "../services/budgetService";
import categoryService from "../services/categoryService";
import { budgetKeys, categoryKeys } from "../services/queryKeys";
import { buildCategoryColorMap } from "../utils/categoryColors";

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
      <BudgetPeriodHeader
        periodLabel={periodLabel}
        onPrev={() => setPeriod((prev) => shiftPeriod(prev.year, prev.month, -1))}
        onNext={() => setPeriod((prev) => shiftPeriod(prev.year, prev.month, 1))}
      />

      <BudgetStats
        loading={loading}
        progress={progress}
        totalAmount={totalAmount}
        allocatedTotal={allocatedTotal}
        budget={budget}
        periodLabel={periodLabel}
      />

      <BudgetForm
        periodLabel={periodLabel}
        budget={budget}
        saving={saving}
        deletePending={deleteMutation.isPending}
        onCopyPrevious={() => copyMutation.mutate()}
        onRequestDelete={() => setDeleteOpen(true)}
        totalAmount={totalAmount}
        setTotalAmount={setTotalAmount}
        notes={notes}
        setNotes={setNotes}
        categories={categories}
        allocationRows={allocationRows}
        allocationDraft={allocationDraft}
        setAllocationDraft={setAllocationDraft}
        colorMap={colorMap}
        onSubmit={handleSave}
        savePending={saveMutation.isPending}
      />

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
