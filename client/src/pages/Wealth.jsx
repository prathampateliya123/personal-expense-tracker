import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ConfirmModal from "../components/modal/ConfirmModal";
import { IconPlus } from "../components/ui/Icons";
import WealthStats from "../components/wealth/WealthStats";
import SavingsSection from "../components/wealth/SavingsSection";
import InvestmentsSection from "../components/wealth/InvestmentsSection";
import MoneyFormModal from "../components/wealth/MoneyFormModal";
import { TABS } from "../components/wealth/wealthHelpers";
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

const Wealth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState(
    tabParam === "investments" ? "investments" : "savings"
  );

  const [savingFilters, setSavingFilters] = useState({
    ...INITIAL_SAVING_FILTERS,
  });
  const [savingSearch, setSavingSearch] = useState("");
  const [debouncedSavingSearch, setDebouncedSavingSearch] = useState("");
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
  const [deleteInvestmentTarget, setDeleteInvestmentTarget] = useState(null);

  useEffect(() => {
    if (tabParam === "investments" || tabParam === "savings") {
      setTab(tabParam);
    }
  }, [tabParam]);

  const changeTab = (next) => {
    setTab(next);
    setSearchParams(next === "savings" ? {} : { tab: next }, { replace: true });
  };

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
          <Link
            to="/wealth/savings/add"
            className="btn-primary inline-flex shrink-0 items-center gap-1.5 self-start sm:self-auto"
          >
            <IconPlus className="h-4 w-4" />
            Add saving goal
          </Link>
        ) : (
          <Link
            to="/wealth/investments/add"
            className="btn-primary inline-flex shrink-0 items-center gap-1.5 self-start sm:self-auto"
          >
            <IconPlus className="h-4 w-4" />
            Add investment
          </Link>
        )}
      </div>

      <div className="flex w-fit gap-1 rounded-lg border border-border bg-surfaceLight p-1">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => changeTab(item.key)}
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
            onEdit={(item) => navigate(`/wealth/savings/${item._id}/edit`)}
            onDelete={setDeleteSavingTarget}
          />
        </>
      ) : (
        <>
          <WealthStats variant="investments" stats={investmentStats} />
          <InvestmentsSection
            investments={investments}
            loading={investmentLoading}
            search={investmentSearch}
            onSearchChange={setInvestmentSearch}
            filters={investmentFilters}
            onFiltersChange={patchInvestmentFilters}
            listMeta={investmentListQuery.data}
            onEdit={(item) =>
              navigate(`/wealth/investments/${item._id}/edit`)
            }
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
