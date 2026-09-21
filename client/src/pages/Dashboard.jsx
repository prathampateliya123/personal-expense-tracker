import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUserProfile } from "../context/UserProfileContext";
import {
  DashboardHero,
  DashboardKpis,
  DashboardQuickActions,
  DashboardBudgetCard,
  DashboardCategoryCard,
  DashboardModuleGrid,
  DashboardRecentExpenses,
  DashboardAccountSnapshot,
  DashboardCashFlowChart,
} from "../components/dashboard/DashboardSections";
import { buildCategoryColorMap } from "../utils/categoryColors";
import expenseService, { INITIAL_EXPENSE_FILTERS } from "../services/expenseService";
import incomeService, { INITIAL_INCOME_FILTERS } from "../services/incomeService";
import budgetService, { getCurrentPeriod } from "../services/budgetService";
import savingService from "../services/savingService";
import investmentService from "../services/investmentService";
import subscriptionService from "../services/subscriptionService";
import tripService from "../services/tripService";
import reportService from "../services/reportService";
import categoryService from "../services/categoryService";
import {
  expenseKeys,
  incomeKeys,
  categoryKeys,
  budgetKeys,
  savingKeys,
  investmentKeys,
  subscriptionKeys,
  tripKeys,
  reportKeys,
} from "../services/queryKeys";

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Dashboard = () => {
  const { user } = useUserProfile();
  const today = new Date().toISOString().split("T")[0];
  const period = useMemo(() => getCurrentPeriod(), []);
  const periodLabel = `${MONTH_LABELS[period.month - 1]} ${period.year}`;

  const todayExpenseFilters = useMemo(
    () => ({
      ...INITIAL_EXPENSE_FILTERS,
      startDate: today,
      endDate: today,
      limit: 50,
    }),
    [today]
  );

  const todayIncomeFilters = useMemo(
    () => ({
      ...INITIAL_INCOME_FILTERS,
      startDate: today,
      endDate: today,
      limit: 50,
    }),
    [today]
  );

  const recentExpenseFilters = useMemo(
    () => ({ ...INITIAL_EXPENSE_FILTERS, limit: 6 }),
    []
  );

  const reportParams = useMemo(
    () => ({
      period: "monthly",
      year: period.year,
      month: period.month,
    }),
    [period.year, period.month]
  );

  const expenseStatsQuery = useQuery({
    queryKey: expenseKeys.stats(),
    queryFn: async () => (await expenseService.getStats()).stats,
  });

  const incomeStatsQuery = useQuery({
    queryKey: incomeKeys.stats(),
    queryFn: async () => (await incomeService.getStats()).stats,
  });

  const budgetQuery = useQuery({
    queryKey: budgetKeys.current(period.year, period.month),
    queryFn: () => budgetService.current(period),
  });

  const savingStatsQuery = useQuery({
    queryKey: savingKeys.stats(),
    queryFn: async () => (await savingService.getStats()).stats,
  });

  const investmentStatsQuery = useQuery({
    queryKey: investmentKeys.stats(),
    queryFn: async () => (await investmentService.getStats()).stats,
  });

  const subscriptionStatsQuery = useQuery({
    queryKey: subscriptionKeys.stats(),
    queryFn: async () => (await subscriptionService.getStats()).stats,
  });

  const tripStatsQuery = useQuery({
    queryKey: tripKeys.stats(),
    queryFn: async () => (await tripService.getStats()).stats,
  });

  const reportQuery = useQuery({
    queryKey: reportKeys.summary(reportParams),
    queryFn: async () => (await reportService.getSummary(reportParams)).report,
  });

  const todayExpenseQuery = useQuery({
    queryKey: expenseKeys.list(todayExpenseFilters),
    queryFn: () => expenseService.list(todayExpenseFilters),
  });

  const todayIncomeQuery = useQuery({
    queryKey: incomeKeys.list(todayIncomeFilters),
    queryFn: () => incomeService.list(todayIncomeFilters),
  });

  const recentQuery = useQuery({
    queryKey: expenseKeys.list(recentExpenseFilters),
    queryFn: () => expenseService.list(recentExpenseFilters),
  });

  const categoriesQuery = useQuery({
    queryKey: categoryKeys.options("expense"),
    queryFn: async () => {
      const data = await categoryService.options("expense");
      return data.categories ?? [];
    },
  });

  const colorMap = useMemo(
    () => buildCategoryColorMap(categoriesQuery.data ?? []),
    [categoriesQuery.data]
  );

  const firstName = user?.name?.split(" ")[0] || "there";
  const expenseStats = expenseStatsQuery.data;
  const incomeStats = incomeStatsQuery.data;
  const budget = budgetQuery.data?.budget;
  const progress = budgetQuery.data?.progress;
  const report = reportQuery.data;

  const todaySpend = todayExpenseQuery.data?.totalAmount || 0;
  const todayIncome = todayIncomeQuery.data?.totalAmount || 0;
  const expenses = recentQuery.data?.expenses ?? [];

  const monthlyExpense =
    report?.summary?.totalExpense ?? expenseStats?.totalAmount ?? 0;
  const monthlyIncome =
    report?.summary?.totalIncome ?? incomeStats?.totalAmount ?? 0;
  const monthlyNet = report?.summary?.net ?? monthlyIncome - monthlyExpense;
  const savingsRate =
    report?.summary?.savingsRate ??
    (monthlyIncome > 0
      ? Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 1000) / 10
      : 0);

  const monthlyBudget = progress?.totalAmount || 0;
  const hasBudget = Boolean(budget);
  const savingStats = savingStatsQuery.data;
  const investmentStats = investmentStatsQuery.data;
  const wealthTotal =
    (savingStats?.totalSaved || 0) + (investmentStats?.totalCurrent || 0);

  const categoryItems =
    report?.byCategory?.expense?.length
      ? report.byCategory.expense
      : (expenseStats?.byCategory || []).map((row) => ({
          category: row.category,
          total: row.total,
          count: row.count,
          percent:
            monthlyExpense > 0
              ? Math.round((row.total / monthlyExpense) * 1000) / 10
              : 0,
        }));

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <DashboardHero
        firstName={firstName}
        periodLabel={periodLabel}
        todaySpend={todaySpend}
        todayIncome={todayIncome}
        monthlyNet={monthlyNet}
        savingsRate={savingsRate}
        expenseCount={
          report?.summary?.expenseCount ?? expenseStats?.count ?? 0
        }
      />

      <DashboardKpis
        monthlyIncome={monthlyIncome}
        monthlyExpense={monthlyExpense}
        monthlyNet={monthlyNet}
        wealthTotal={wealthTotal}
        budgetUsed={progress?.percentUsed || 0}
        hasBudget={hasBudget}
      />

      <DashboardQuickActions />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <DashboardCashFlowChart series={report?.incomeVsExpense || []} />
        <DashboardBudgetCard
          hasBudget={hasBudget}
          progress={progress}
          monthlyBudget={monthlyBudget}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardCategoryCard items={categoryItems} colorMap={colorMap} />
        <DashboardAccountSnapshot items={report?.byAccount || []} />
      </div>

      <DashboardModuleGrid
        wealthTotal={wealthTotal}
        savingStats={savingStats}
        investmentStats={investmentStats}
        subscriptionStats={subscriptionStatsQuery.data}
        tripStats={tripStatsQuery.data}
      />

      <DashboardRecentExpenses
        expenses={expenses}
        loading={recentQuery.isLoading}
        colorMap={colorMap}
      />
    </div>
  );
};

export default Dashboard;
