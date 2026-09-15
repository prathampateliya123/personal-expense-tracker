import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/modal/ConfirmModal";
import { IconPlus } from "../components/ui/Icons";
import WealthStats from "../components/wealth/WealthStats";
import SavingsSection from "../components/wealth/SavingsSection";
import InvestmentsSection from "../components/wealth/InvestmentsSection";
import SavingFormModal from "../components/wealth/SavingFormModal";
import InvestmentFormModal from "../components/wealth/InvestmentFormModal";
import MoneyFormModal from "../components/wealth/MoneyFormModal";
import {
  TABS,
  emptySavingForm,
  emptyInvestmentForm,
  savingToForm,
  investmentToForm,
} from "../components/wealth/wealthHelpers";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import savingService, {
  INITIAL_SAVING_FILTERS,
} from "../services/savingService";
import investmentService, {
  INITIAL_INVESTMENT_FILTERS,
} from "../services/investmentService";
import { savingKeys, investmentKeys } from "../services/queryKeys";
import { debounce } from "../utils/helper";
import { DEFAULT_DEBOUNCE_MS } from "../utils/constants";
import { toDateInputValue } from "../utils/wealthConstants";

const Wealth = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("savings");

  const [savingFilters, setSavingFilters] = useState({
    ...INITIAL_SAVING_FILTERS,
  });
  const [savingSearch, setSavingSearch] = useState("");
  const [debouncedSavingSearch, setDebouncedSavingSearch] = useState("");
  const [savingForm, setSavingForm] = useState(emptySavingForm);
  const [editingSaving, setEditingSaving] = useState(null);
  const [showSavingForm, setShowSavingForm] = useState(false);
  const [deleteSavingTarget, setDeleteSavingTarget] = useState(null);
  const [moneyTarget, setMoneyTarget] = useState(null);
  const [moneyAmount, setMoneyAmount] = useState("");
  const [moneyMode, setMoneyMode] = useState("contribute");

  const [investmentFilters, setInvestmentFilters] = useState({
    ...INITIAL_INVESTMENT_FILTERS,
  });
  const [investmentSearch, setInvestmentSearch] = useState("");
  const [debouncedInvestmentSearch, setDebouncedInvestmentSearch] =
    useState("");
  const [investmentForm, setInvestmentForm] = useState(emptyInvestmentForm);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [deleteInvestmentTarget, setDeleteInvestmentTarget] = useState(null);

  const debounceSaving = useMemo(
    () => debounce(setDebouncedSavingSearch, DEFAULT_DEBOUNCE_MS),
    []
  );
  const debounceInvestment = useMemo(
    () => debounce(setDebouncedInvestmentSearch, DEFAULT_DEBOUNCE_MS),
    []
  );

  useEffect(() => {
    debounceSaving(savingSearch);
    return () => debounceSaving.cancel();
  }, [savingSearch, debounceSaving]);

  useEffect(() => {
    if (debouncedSavingSearch === savingFilters.search) return;
    setSavingFilters((prev) => ({
      ...prev,
      search: debouncedSavingSearch,
      page: 1,
    }));
  }, [debouncedSavingSearch]);

  useEffect(() => {
    debounceInvestment(investmentSearch);
    return () => debounceInvestment.cancel();
  }, [investmentSearch, debounceInvestment]);

  useEffect(() => {
    if (debouncedInvestmentSearch === investmentFilters.search) return;
    setInvestmentFilters((prev) => ({
      ...prev,
      search: debouncedInvestmentSearch,
      page: 1,
    }));
  }, [debouncedInvestmentSearch]);

  const savingListQuery = useQuery({
    queryKey: savingKeys.list(savingFilters),
    queryFn: () => savingService.list(savingFilters),
    enabled: tab === "savings",
    placeholderData: (previous) => previous,
  });

  const savingStatsQuery = useQuery({
    queryKey: savingKeys.stats(),
    queryFn: async () => {
      const data = await savingService.getStats();
      return data.stats;
    },
  });

  const investmentListQuery = useQuery({
    queryKey: investmentKeys.list(investmentFilters),
    queryFn: () => investmentService.list(investmentFilters),
    enabled: tab === "investments",
    placeholderData: (previous) => previous,
  });

  const investmentStatsQuery = useQuery({
    queryKey: investmentKeys.stats(),
    queryFn: async () => {
      const data = await investmentService.getStats();
      return data.stats;
    },
  });

  const invalidateSavings = async () => {
    await queryClient.invalidateQueries({ queryKey: savingKeys.all });
  };

  const invalidateInvestments = async () => {
    await queryClient.invalidateQueries({ queryKey: investmentKeys.all });
  };

  const createSavingMutation = useMutation({
    mutationFn: (payload) => savingService.create(payload),
    onSuccess: async () => {
      showSuccessToast("Saving goal created");
      setShowSavingForm(false);
      setSavingForm(emptySavingForm);
      await invalidateSavings();
    },
    onError: handleApiError,
  });

  const updateSavingMutation = useMutation({
    mutationFn: ({ id, payload }) => savingService.update(id, payload),
    onSuccess: async () => {
      showSuccessToast("Saving goal updated");
      setEditingSaving(null);
      setShowSavingForm(false);
      setSavingForm(emptySavingForm);
      await invalidateSavings();
    },
    onError: handleApiError,
  });

  const deleteSavingMutation = useMutation({
    mutationFn: (id) => savingService.remove(id),
    onSuccess: async () => {
      showSuccessToast("Saving goal deleted");
      setDeleteSavingTarget(null);
      await invalidateSavings();
    },
    onError: handleApiError,
  });

  const moneyMutation = useMutation({
    mutationFn: ({ id, mode, amount }) =>
      mode === "contribute"
        ? savingService.contribute(id, amount)
        : savingService.withdraw(id, amount),
    onSuccess: async (_data, vars) => {
      showSuccessToast(
        vars.mode === "contribute" ? "Amount added" : "Amount withdrawn"
      );
      setMoneyTarget(null);
      setMoneyAmount("");
      await invalidateSavings();
    },
    onError: handleApiError,
  });

  const createInvestmentMutation = useMutation({
    mutationFn: (payload) => investmentService.create(payload),
    onSuccess: async () => {
      showSuccessToast("Investment added");
      setShowInvestmentForm(false);
      setInvestmentForm(emptyInvestmentForm);
      await invalidateInvestments();
    },
    onError: handleApiError,
  });

  const updateInvestmentMutation = useMutation({
    mutationFn: ({ id, payload }) => investmentService.update(id, payload),
    onSuccess: async () => {
      showSuccessToast("Investment updated");
      setEditingInvestment(null);
      setShowInvestmentForm(false);
      setInvestmentForm(emptyInvestmentForm);
      await invalidateInvestments();
    },
    onError: handleApiError,
  });

  const deleteInvestmentMutation = useMutation({
    mutationFn: (id) => investmentService.remove(id),
    onSuccess: async () => {
      showSuccessToast("Investment deleted");
      setDeleteInvestmentTarget(null);
      await invalidateInvestments();
    },
    onError: handleApiError,
  });

  const savings = savingListQuery.data?.savings ?? [];
  const savingStats = savingStatsQuery.data;
  const investments = investmentListQuery.data?.investments ?? [];
  const investmentStats = investmentStatsQuery.data;

  const startEditSaving = (item) => {
    setEditingSaving(item);
    setShowSavingForm(true);
    setSavingForm(savingToForm(item));
  };

  const startEditInvestment = (item) => {
    setEditingInvestment(item);
    setShowInvestmentForm(true);
    setInvestmentForm(investmentToForm(item));
  };

  const handleSavingSubmit = (e) => {
    e.preventDefault();
    const name = savingForm.name.trim();
    const targetAmount = Number(savingForm.targetAmount);
    const currentAmount = Number(savingForm.currentAmount || 0);

    if (!name) {
      handleApiError({ message: "Goal name is required" });
      return;
    }
    if (!savingForm.targetAmount || Number.isNaN(targetAmount) || targetAmount <= 0) {
      handleApiError({ message: "Enter a valid target amount" });
      return;
    }
    if (Number.isNaN(currentAmount) || currentAmount < 0) {
      handleApiError({ message: "Saved amount cannot be negative" });
      return;
    }

    const payload = {
      name,
      targetAmount,
      currentAmount,
      deadline: savingForm.deadline || null,
      notes: savingForm.notes.trim(),
      status: savingForm.status,
    };

    if (editingSaving) {
      updateSavingMutation.mutate({ id: editingSaving._id, payload });
    } else {
      createSavingMutation.mutate(payload);
    }
  };

  const handleInvestmentSubmit = (e) => {
    e.preventDefault();
    const name = investmentForm.name.trim();
    const amountInvested = Number(investmentForm.amountInvested);
    const currentValue = Number(investmentForm.currentValue);

    if (!name) {
      handleApiError({ message: "Investment name is required" });
      return;
    }
    if (
      !investmentForm.amountInvested ||
      Number.isNaN(amountInvested) ||
      amountInvested <= 0
    ) {
      handleApiError({ message: "Enter a valid invested amount" });
      return;
    }
    if (
      investmentForm.currentValue === "" ||
      Number.isNaN(currentValue) ||
      currentValue < 0
    ) {
      handleApiError({ message: "Enter a valid current value" });
      return;
    }

    const payload = {
      name,
      type: investmentForm.type,
      amountInvested,
      currentValue,
      purchaseDate: investmentForm.purchaseDate,
      institution: investmentForm.institution.trim(),
      notes: investmentForm.notes.trim(),
    };

    if (editingInvestment) {
      updateInvestmentMutation.mutate({ id: editingInvestment._id, payload });
    } else {
      createInvestmentMutation.mutate(payload);
    }
  };

  const handleMoneySubmit = (e) => {
    e.preventDefault();
    const amount = Number(moneyAmount);
    if (!moneyTarget || Number.isNaN(amount) || amount <= 0) {
      handleApiError({ message: "Enter a valid amount" });
      return;
    }
    moneyMutation.mutate({
      id: moneyTarget._id,
      mode: moneyMode,
      amount,
    });
  };

  const patchSavingForm = (patch) =>
    setSavingForm((prev) => ({ ...prev, ...patch }));
  const patchInvestmentForm = (patch) =>
    setInvestmentForm((prev) => ({ ...prev, ...patch }));
  const patchSavingFilters = (patch) =>
    setSavingFilters((prev) => ({ ...prev, ...patch }));
  const patchInvestmentFilters = (patch) =>
    setInvestmentFilters((prev) => ({ ...prev, ...patch }));

  const savingLoading =
    savingListQuery.isLoading || savingListQuery.isFetching;
  const investmentLoading =
    investmentListQuery.isLoading || investmentListQuery.isFetching;

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
            Savings & Investments
          </h1>
          <p className="mt-1 text-sm text-textSecondary">
            Track saving goals and grow your investment portfolio
          </p>
        </div>
        {tab === "savings" ? (
          <Button
            type="button"
            className="self-start sm:self-auto"
            onClick={() => {
              setEditingSaving(null);
              setSavingForm(emptySavingForm);
              setShowSavingForm(true);
            }}
          >
            <IconPlus className="h-4 w-4" />
            Add saving goal
          </Button>
        ) : (
          <Button
            type="button"
            className="self-start sm:self-auto"
            onClick={() => {
              setEditingInvestment(null);
              setInvestmentForm({
                ...emptyInvestmentForm,
                purchaseDate: toDateInputValue(new Date()),
              });
              setShowInvestmentForm(true);
            }}
          >
            <IconPlus className="h-4 w-4" />
            Add investment
          </Button>
        )}
      </div>

      <div className="flex w-fit gap-1 rounded-lg border border-border bg-surfaceLight p-1">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              tab === item.key
                ? "bg-white text-primaryDark shadow-sm"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "savings" ? (
        <>
          <WealthStats variant="savings" stats={savingStats} />
          {showSavingForm ? (
            <SavingFormModal
              form={savingForm}
              onChange={patchSavingForm}
              editing={editingSaving}
              onSubmit={handleSavingSubmit}
              onCancel={() => {
                setShowSavingForm(false);
                setEditingSaving(null);
                setSavingForm(emptySavingForm);
              }}
              loading={
                createSavingMutation.isPending || updateSavingMutation.isPending
              }
            />
          ) : null}
          <SavingsSection
            savings={savings}
            loading={savingLoading}
            search={savingSearch}
            onSearchChange={setSavingSearch}
            filters={savingFilters}
            onFiltersChange={patchSavingFilters}
            listMeta={savingListQuery.data}
            onContribute={(item) => {
              setMoneyMode("contribute");
              setMoneyTarget(item);
              setMoneyAmount("");
            }}
            onWithdraw={(item) => {
              setMoneyMode("withdraw");
              setMoneyTarget(item);
              setMoneyAmount("");
            }}
            onEdit={startEditSaving}
            onDelete={setDeleteSavingTarget}
          />
        </>
      ) : (
        <>
          <WealthStats variant="investments" stats={investmentStats} />
          {showInvestmentForm ? (
            <InvestmentFormModal
              form={investmentForm}
              onChange={patchInvestmentForm}
              editing={editingInvestment}
              onSubmit={handleInvestmentSubmit}
              onCancel={() => {
                setShowInvestmentForm(false);
                setEditingInvestment(null);
                setInvestmentForm(emptyInvestmentForm);
              }}
              loading={
                createInvestmentMutation.isPending ||
                updateInvestmentMutation.isPending
              }
            />
          ) : null}
          <InvestmentsSection
            investments={investments}
            loading={investmentLoading}
            search={investmentSearch}
            onSearchChange={setInvestmentSearch}
            filters={investmentFilters}
            onFiltersChange={patchInvestmentFilters}
            listMeta={investmentListQuery.data}
            onEdit={startEditInvestment}
            onDelete={setDeleteInvestmentTarget}
          />
        </>
      )}

      <ConfirmModal
        open={Boolean(deleteSavingTarget)}
        title="Delete saving goal?"
        description={
          deleteSavingTarget
            ? `Delete “${deleteSavingTarget.name}”? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        danger
        confirming={deleteSavingMutation.isPending}
        onClose={() => {
          if (!deleteSavingMutation.isPending) setDeleteSavingTarget(null);
        }}
        onConfirm={() => {
          if (!deleteSavingTarget) return;
          deleteSavingMutation.mutate(deleteSavingTarget._id);
        }}
      />

      <ConfirmModal
        open={Boolean(deleteInvestmentTarget)}
        title="Delete investment?"
        description={
          deleteInvestmentTarget
            ? `Delete “${deleteInvestmentTarget.name}”? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        danger
        confirming={deleteInvestmentMutation.isPending}
        onClose={() => {
          if (!deleteInvestmentMutation.isPending) {
            setDeleteInvestmentTarget(null);
          }
        }}
        onConfirm={() => {
          if (!deleteInvestmentTarget) return;
          deleteInvestmentMutation.mutate(deleteInvestmentTarget._id);
        }}
      />

      <MoneyFormModal
        target={moneyTarget}
        mode={moneyMode}
        amount={moneyAmount}
        onAmountChange={setMoneyAmount}
        onSubmit={handleMoneySubmit}
        onCancel={() => {
          if (!moneyMutation.isPending) {
            setMoneyTarget(null);
            setMoneyAmount("");
          }
        }}
        loading={moneyMutation.isPending}
      />
    </div>
  );
};

export default Wealth;
