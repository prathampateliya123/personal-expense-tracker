/**
 * pages/Wealth.jsx
 * Savings goals + Investments management in one module.
 */

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import DateInput from "../components/ui/DateInput";
import ConfirmModal from "../components/modal/ConfirmModal";
import TableSearch from "../components/table/TableSearch";
import TablePager, { TableLimit } from "../components/table/TablePager";
import NoDataFound from "../components/ui/NoDataFound";
import CircularProgress from "../components/dashboard/CircularProgress";
import {
  PencilSquareIcon,
  TrashIcon,
  IconPlus,
} from "../components/ui/Icons";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import savingService, {
  INITIAL_SAVING_FILTERS,
} from "../services/savingService";
import investmentService, {
  INITIAL_INVESTMENT_FILTERS,
} from "../services/investmentService";
import { savingKeys, investmentKeys } from "../services/queryKeys";
import { formatCurrency, formatExpenseDate } from "../utils/expenseConstants";
import { debounce } from "../utils/helper";
import { DEFAULT_DEBOUNCE_MS } from "../utils/constants";
import {
  INVESTMENT_TYPE_OPTIONS,
  SAVING_STATUS_OPTIONS,
  getInvestmentTypeLabel,
  getSavingStatusLabel,
  toDateInputValue,
} from "../utils/wealthConstants";

const TABS = [
  { key: "savings", label: "Savings" },
  { key: "investments", label: "Investments" },
];

const emptySavingForm = {
  name: "",
  targetAmount: "",
  currentAmount: "",
  deadline: "",
  notes: "",
  status: "active",
};

const emptyInvestmentForm = {
  name: "",
  type: "mutual_fund",
  amountInvested: "",
  currentValue: "",
  purchaseDate: toDateInputValue(new Date()),
  institution: "",
  notes: "",
};

const StatCard = ({ label, value, hint, danger = false }) => (
  <div className="card flex min-h-[92px] flex-col justify-center p-5">
    <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">
      {label}
    </p>
    <p
      className={`mt-1 text-2xl font-bold ${
        danger ? "text-red-500" : "text-primaryDark"
      }`}
    >
      {value}
    </p>
    {hint ? <p className="mt-1 text-xs text-textSecondary">{hint}</p> : null}
  </div>
);

const ProgressBar = ({ percent = 0 }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-surfaceGray">
    <div
      className="h-full rounded-full bg-accentGreen transition-all"
      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
    />
  </div>
);

const labelClass = "mb-1.5 block text-sm font-medium text-textPrimary";

const Wealth = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("savings");

  // Savings state
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

  // Investments state
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
  }, [debouncedSavingSearch]); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [debouncedInvestmentSearch]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setSavingForm({
      name: item.name || "",
      targetAmount: String(item.targetAmount ?? ""),
      currentAmount: String(item.currentAmount ?? ""),
      deadline: toDateInputValue(item.deadline),
      notes: item.notes || "",
      status: item.status || "active",
    });
  };

  const startEditInvestment = (item) => {
    setEditingInvestment(item);
    setShowInvestmentForm(true);
    setInvestmentForm({
      name: item.name || "",
      type: item.type || "other",
      amountInvested: String(item.amountInvested ?? ""),
      currentValue: String(item.currentValue ?? ""),
      purchaseDate: toDateInputValue(item.purchaseDate) || toDateInputValue(new Date()),
      institution: item.institution || "",
      notes: item.notes || "",
    });
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total saved"
              value={formatCurrency(savingStats?.totalSaved)}
              hint={`${savingStats?.totalGoals || 0} goals`}
            />
            <StatCard
              label="Total targets"
              value={formatCurrency(savingStats?.totalTarget)}
              hint={`${savingStats?.active || 0} active`}
            />
            <StatCard
              label="Remaining"
              value={formatCurrency(savingStats?.remaining)}
              hint={`${savingStats?.completed || 0} completed`}
            />
            <div className="card flex items-center justify-center p-4">
              <CircularProgress
                percent={savingStats?.percentComplete || 0}
                label="overall"
                size={120}
              />
            </div>
          </div>

          {showSavingForm ? (
            <form
              onSubmit={handleSavingSubmit}
              className="card flex w-full flex-col gap-4 p-5 sm:p-6"
            >
              <h2 className="text-base font-semibold text-textPrimary">
                {editingSaving ? `Edit “${editingSaving.name}”` : "New saving goal"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="saving-name" className={labelClass}>
                    Goal name
                  </label>
                  <input
                    id="saving-name"
                    className="fintech-input"
                    value={savingForm.name}
                    onChange={(e) =>
                      setSavingForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Emergency fund"
                    maxLength={60}
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="saving-target" className={labelClass}>
                    Target amount (₹)
                  </label>
                  <input
                    id="saving-target"
                    type="number"
                    min="0"
                    step="0.01"
                    className="fintech-input"
                    value={savingForm.targetAmount}
                    onChange={(e) =>
                      setSavingForm((prev) => ({
                        ...prev,
                        targetAmount: e.target.value,
                      }))
                    }
                    placeholder="100000"
                  />
                </div>
                <div>
                  <label htmlFor="saving-current" className={labelClass}>
                    Already saved (₹)
                  </label>
                  <input
                    id="saving-current"
                    type="number"
                    min="0"
                    step="0.01"
                    className="fintech-input"
                    value={savingForm.currentAmount}
                    onChange={(e) =>
                      setSavingForm((prev) => ({
                        ...prev,
                        currentAmount: e.target.value,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
                <DateInput
                  id="saving-deadline"
                  name="deadline"
                  label="Deadline (optional)"
                  labelClassName={labelClass}
                  value={savingForm.deadline}
                  onChange={(e) =>
                    setSavingForm((prev) => ({
                      ...prev,
                      deadline: e.target.value,
                    }))
                  }
                />
                <Select
                  id="saving-status"
                  name="status"
                  label="Status"
                  labelClassName={labelClass}
                  value={savingForm.status}
                  onChange={(e) =>
                    setSavingForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  options={SAVING_STATUS_OPTIONS}
                />
                <div className="sm:col-span-2">
                  <label htmlFor="saving-notes" className={labelClass}>
                    Notes (optional)
                  </label>
                  <input
                    id="saving-notes"
                    className="fintech-input"
                    value={savingForm.notes}
                    onChange={(e) =>
                      setSavingForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Why this goal matters"
                    maxLength={300}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowSavingForm(false);
                    setEditingSaving(null);
                    setSavingForm(emptySavingForm);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={
                    createSavingMutation.isPending ||
                    updateSavingMutation.isPending
                  }
                >
                  {editingSaving ? "Save changes" : "Create goal"}
                </Button>
              </div>
            </form>
          ) : null}

          <div className="table-panel w-full overflow-hidden">
            <div className="border-b border-border bg-surfaceLight/50 px-3 py-2.5 sm:px-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <TableSearch
                    value={savingSearch}
                    onChange={setSavingSearch}
                    placeholder="Search goals..."
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    id="saving-filter-status"
                    value={savingFilters.status}
                    onChange={(e) =>
                      setSavingFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                        page: 1,
                      }))
                    }
                    placeholder="Status"
                    options={SAVING_STATUS_OPTIONS}
                    size="sm"
                  />
                  <TableLimit
                    value={savingFilters.limit}
                    onChange={(limit) =>
                      setSavingFilters((prev) => ({ ...prev, limit, page: 1 }))
                    }
                  />
                </div>
              </div>
            </div>

            {savingLoading && savings.length === 0 ? (
              <div className="space-y-3 p-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-surfaceGray" />
                ))}
              </div>
            ) : savings.length === 0 ? (
              <NoDataFound />
            ) : (
              <div className="divide-y divide-border">
                {savings.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-textPrimary">{item.name}</p>
                        <span className="rounded-md bg-surfaceGray px-2 py-0.5 text-xs font-medium text-textSecondary">
                          {getSavingStatusLabel(item.status)}
                        </span>
                      </div>
                      <p className="text-sm text-textSecondary">
                        {formatCurrency(item.currentAmount)} of{" "}
                        {formatCurrency(item.targetAmount)}
                        {item.deadline
                          ? ` · due ${formatExpenseDate(item.deadline)}`
                          : ""}
                      </p>
                      <ProgressBar percent={item.percentComplete || 0} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setMoneyMode("contribute");
                          setMoneyTarget(item);
                          setMoneyAmount("");
                        }}
                      >
                        Add money
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setMoneyMode("withdraw");
                          setMoneyTarget(item);
                          setMoneyAmount("");
                        }}
                      >
                        Withdraw
                      </Button>
                      <button
                        type="button"
                        onClick={() => startEditSaving(item)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-textSecondary hover:bg-successBg hover:text-primaryDark"
                        aria-label={`Edit ${item.name}`}
                      >
                        <PencilSquareIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteSavingTarget(item)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-textSecondary hover:bg-red-50 hover:text-red-500"
                        aria-label={`Delete ${item.name}`}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <TablePager
              page={savingListQuery.data?.currentPage || savingFilters.page}
              totalPages={savingListQuery.data?.totalPages || 1}
              totalRecords={savingListQuery.data?.totalCount || 0}
              pageSize={savingFilters.limit}
              entityName="goals"
              disabled={savingLoading}
              onPageChange={(page) =>
                setSavingFilters((prev) => ({ ...prev, page }))
              }
            />
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Invested"
              value={formatCurrency(investmentStats?.totalInvested)}
              hint={`${investmentStats?.count || 0} holdings`}
            />
            <StatCard
              label="Current value"
              value={formatCurrency(investmentStats?.totalCurrent)}
            />
            <StatCard
              label="Gain / Loss"
              value={formatCurrency(investmentStats?.gainLoss)}
              hint={`${investmentStats?.returnPercent || 0}% return`}
              danger={(investmentStats?.gainLoss || 0) < 0}
            />
            <StatCard
              label="Top type"
              value={
                investmentStats?.byType?.[0]
                  ? getInvestmentTypeLabel(investmentStats.byType[0].type)
                  : "—"
              }
              hint={
                investmentStats?.byType?.[0]
                  ? formatCurrency(investmentStats.byType[0].totalCurrent)
                  : "No investments yet"
              }
            />
          </div>

          {showInvestmentForm ? (
            <form
              onSubmit={handleInvestmentSubmit}
              className="card flex w-full flex-col gap-4 p-5 sm:p-6"
            >
              <h2 className="text-base font-semibold text-textPrimary">
                {editingInvestment
                  ? `Edit “${editingInvestment.name}”`
                  : "New investment"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="inv-name" className={labelClass}>
                    Name
                  </label>
                  <input
                    id="inv-name"
                    className="fintech-input"
                    value={investmentForm.name}
                    onChange={(e) =>
                      setInvestmentForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g. Nifty 50 Index Fund"
                    maxLength={80}
                    autoFocus
                  />
                </div>
                <Select
                  id="inv-type"
                  name="type"
                  label="Type"
                  labelClassName={labelClass}
                  value={investmentForm.type}
                  onChange={(e) =>
                    setInvestmentForm((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  options={INVESTMENT_TYPE_OPTIONS}
                />
                <DateInput
                  id="inv-date"
                  name="purchaseDate"
                  label="Purchase date"
                  labelClassName={labelClass}
                  value={investmentForm.purchaseDate}
                  onChange={(e) =>
                    setInvestmentForm((prev) => ({
                      ...prev,
                      purchaseDate: e.target.value,
                    }))
                  }
                  required
                />
                <div>
                  <label htmlFor="inv-invested" className={labelClass}>
                    Amount invested (₹)
                  </label>
                  <input
                    id="inv-invested"
                    type="number"
                    min="0"
                    step="0.01"
                    className="fintech-input"
                    value={investmentForm.amountInvested}
                    onChange={(e) =>
                      setInvestmentForm((prev) => ({
                        ...prev,
                        amountInvested: e.target.value,
                      }))
                    }
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label htmlFor="inv-current" className={labelClass}>
                    Current value (₹)
                  </label>
                  <input
                    id="inv-current"
                    type="number"
                    min="0"
                    step="0.01"
                    className="fintech-input"
                    value={investmentForm.currentValue}
                    onChange={(e) =>
                      setInvestmentForm((prev) => ({
                        ...prev,
                        currentValue: e.target.value,
                      }))
                    }
                    placeholder="52000"
                  />
                </div>
                <div>
                  <label htmlFor="inv-institution" className={labelClass}>
                    Institution (optional)
                  </label>
                  <input
                    id="inv-institution"
                    className="fintech-input"
                    value={investmentForm.institution}
                    onChange={(e) =>
                      setInvestmentForm((prev) => ({
                        ...prev,
                        institution: e.target.value,
                      }))
                    }
                    placeholder="e.g. Groww, Zerodha, SBI"
                    maxLength={80}
                  />
                </div>
                <div>
                  <label htmlFor="inv-notes" className={labelClass}>
                    Notes (optional)
                  </label>
                  <input
                    id="inv-notes"
                    className="fintech-input"
                    value={investmentForm.notes}
                    onChange={(e) =>
                      setInvestmentForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Optional notes"
                    maxLength={300}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowInvestmentForm(false);
                    setEditingInvestment(null);
                    setInvestmentForm(emptyInvestmentForm);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={
                    createInvestmentMutation.isPending ||
                    updateInvestmentMutation.isPending
                  }
                >
                  {editingInvestment ? "Save changes" : "Add investment"}
                </Button>
              </div>
            </form>
          ) : null}

          <div className="table-panel w-full overflow-hidden">
            <div className="border-b border-border bg-surfaceLight/50 px-3 py-2.5 sm:px-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <TableSearch
                    value={investmentSearch}
                    onChange={setInvestmentSearch}
                    placeholder="Search investments..."
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    id="inv-filter-type"
                    value={investmentFilters.type}
                    onChange={(e) =>
                      setInvestmentFilters((prev) => ({
                        ...prev,
                        type: e.target.value,
                        page: 1,
                      }))
                    }
                    placeholder="Type"
                    options={INVESTMENT_TYPE_OPTIONS}
                    size="sm"
                  />
                  <TableLimit
                    value={investmentFilters.limit}
                    onChange={(limit) =>
                      setInvestmentFilters((prev) => ({
                        ...prev,
                        limit,
                        page: 1,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {investmentLoading && investments.length === 0 ? (
              <div className="space-y-3 p-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-surfaceGray" />
                ))}
              </div>
            ) : investments.length === 0 ? (
              <NoDataFound />
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surfaceLight/60 text-xs font-semibold uppercase tracking-wide text-textSecondary">
                        <th className="px-5 py-3">Investment</th>
                        <th className="px-5 py-3">Type</th>
                        <th className="px-5 py-3">Invested</th>
                        <th className="px-5 py-3">Current</th>
                        <th className="px-5 py-3">Return</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investments.map((item) => (
                        <tr
                          key={item._id}
                          className="border-b border-border last:border-0 hover:bg-surfaceLight/70"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-textPrimary">
                              {item.name}
                            </p>
                            <p className="text-xs text-textSecondary">
                              {item.institution || formatExpenseDate(item.purchaseDate)}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-textSecondary">
                            {getInvestmentTypeLabel(item.type)}
                          </td>
                          <td className="px-5 py-4">
                            {formatCurrency(item.amountInvested)}
                          </td>
                          <td className="px-5 py-4 font-medium">
                            {formatCurrency(item.currentValue)}
                          </td>
                          <td
                            className={`px-5 py-4 font-medium ${
                              (item.gainLoss || 0) >= 0
                                ? "text-accentGreen"
                                : "text-red-500"
                            }`}
                          >
                            {formatCurrency(item.gainLoss)} ({item.returnPercent}
                            %)
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => startEditInvestment(item)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-textSecondary hover:bg-successBg"
                                aria-label={`Edit ${item.name}`}
                              >
                                <PencilSquareIcon />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteInvestmentTarget(item)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-textSecondary hover:bg-red-50 hover:text-red-500"
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
                  {investments.map((item) => (
                    <div key={item._id} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-textPrimary">
                            {item.name}
                          </p>
                          <p className="text-xs text-textSecondary">
                            {getInvestmentTypeLabel(item.type)}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-semibold ${
                            (item.gainLoss || 0) >= 0
                              ? "text-accentGreen"
                              : "text-red-500"
                          }`}
                        >
                          {item.returnPercent}%
                        </p>
                      </div>
                      <p className="text-sm text-textSecondary">
                        {formatCurrency(item.amountInvested)} →{" "}
                        {formatCurrency(item.currentValue)}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditInvestment(item)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border"
                        >
                          <PencilSquareIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteInvestmentTarget(item)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <TablePager
              page={
                investmentListQuery.data?.currentPage || investmentFilters.page
              }
              totalPages={investmentListQuery.data?.totalPages || 1}
              totalRecords={investmentListQuery.data?.totalCount || 0}
              pageSize={investmentFilters.limit}
              entityName="investments"
              disabled={investmentLoading}
              onPageChange={(page) =>
                setInvestmentFilters((prev) => ({ ...prev, page }))
              }
            />
          </div>
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

      {moneyTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-textPrimary/30 p-4 backdrop-blur-[2px]">
          <form
            onSubmit={handleMoneySubmit}
            className="card w-full max-w-md space-y-4 p-5"
          >
            <h3 className="text-lg font-semibold text-textPrimary">
              {moneyMode === "contribute" ? "Add money" : "Withdraw"} —{" "}
              {moneyTarget.name}
            </h3>
            <p className="text-sm text-textSecondary">
              Current saved: {formatCurrency(moneyTarget.currentAmount)}
            </p>
            <div>
              <label htmlFor="money-amount" className={labelClass}>
                Amount (₹)
              </label>
              <input
                id="money-amount"
                type="number"
                min="0"
                step="0.01"
                className="fintech-input"
                value={moneyAmount}
                onChange={(e) => setMoneyAmount(e.target.value)}
                placeholder="0"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (!moneyMutation.isPending) {
                    setMoneyTarget(null);
                    setMoneyAmount("");
                  }
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={moneyMutation.isPending}>
                Confirm
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
};

export default Wealth;
