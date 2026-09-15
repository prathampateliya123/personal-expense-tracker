/**
 * pages/Dashboard.jsx
 * Fintech-style overview — expenses, incomes, and real budget progress.
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useUserProfile } from "../context/UserProfileContext";
import CircularProgress from "../components/dashboard/CircularProgress";
import NoDataFound from "../components/ui/NoDataFound";
import {
  formatCurrency,
  formatExpenseDate,
  formatExpenseTime,
} from "../utils/expenseConstants";
import { getCategoryAvatarClass, buildCategoryColorMap } from "../utils/categoryColors";
import expenseService, { INITIAL_EXPENSE_FILTERS } from "../services/expenseService";
import incomeService, { INITIAL_INCOME_FILTERS } from "../services/incomeService";
import budgetService, { getCurrentPeriod } from "../services/budgetService";
import savingService from "../services/savingService";
import investmentService from "../services/investmentService";
import categoryService from "../services/categoryService";
import {
  expenseKeys,
  incomeKeys,
  categoryKeys,
  budgetKeys,
  savingKeys,
  investmentKeys,
} from "../services/queryKeys";

const QuickAction = ({ to, icon, label }) => (
  <Link to={to} className="quick-action-btn">
    <span className="text-xl">{icon}</span>
    <span className="text-xs font-medium text-textPrimary">{label}</span>
  </Link>
);

const Dashboard = () => {
  const { user } = useUserProfile();
  const today = new Date().toISOString().split("T")[0];
  const period = useMemo(() => getCurrentPeriod(), []);

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
    () => ({
      ...INITIAL_EXPENSE_FILTERS,
      limit: 5,
    }),
    []
  );

  const expenseStatsQuery = useQuery({
    queryKey: expenseKeys.stats(),
    queryFn: async () => {
      const data = await expenseService.getStats();
      return data.stats;
    },
  });

  const incomeStatsQuery = useQuery({
    queryKey: incomeKeys.stats(),
    queryFn: async () => {
      const data = await incomeService.getStats();
      return data.stats;
    },
  });

  const budgetQuery = useQuery({
    queryKey: budgetKeys.current(period.year, period.month),
    queryFn: () => budgetService.current(period),
  });

  const savingStatsQuery = useQuery({
    queryKey: savingKeys.stats(),
    queryFn: async () => {
      const data = await savingService.getStats();
      return data.stats;
    },
  });

  const investmentStatsQuery = useQuery({
    queryKey: investmentKeys.stats(),
    queryFn: async () => {
      const data = await investmentService.getStats();
      return data.stats;
    },
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
  const todaySpend = todayExpenseQuery.data?.totalAmount || 0;
  const todayIncome = todayIncomeQuery.data?.totalAmount || 0;
  const expenses = recentQuery.data?.expenses ?? [];
  const loading = recentQuery.isLoading;

  const monthlyExpense = expenseStats?.totalAmount || 0;
  const monthlyIncome = incomeStats?.totalAmount || 0;
  const monthlyNet = monthlyIncome - monthlyExpense;
  const monthlyBudget = progress?.totalAmount || 0;
  const spendPercent = progress?.percentUsed || 0;
  const remaining = progress?.remaining || 0;
  const hasBudget = Boolean(budget);
  const savingStats = savingStatsQuery.data;
  const investmentStats = investmentStatsQuery.data;
  const wealthTotal =
    (savingStats?.totalSaved || 0) + (investmentStats?.totalCurrent || 0);

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <div>
        <p className="text-sm text-textSecondary">Welcome back</p>
        <h1 className="text-2xl font-bold text-textPrimary sm:text-3xl">
          Hello, {firstName}!
        </h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="gradient-green-card rounded-3xl p-6 text-white sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Today&apos;s Spend</p>
              <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
                {formatCurrency(todaySpend)}
              </p>
            </div>
            <span className="rounded-xl bg-successBg px-3 py-1 text-xs font-semibold text-successText">
              {expenseStats?.count
                ? `${expenseStats.count} expenses this month`
                : "On track"}
            </span>
          </div>
          <p className="mt-4 text-sm text-white/70">
            Today&apos;s income: {formatCurrency(todayIncome)}
          </p>
        </div>

        <div className="card flex flex-col justify-between p-6 sm:p-8">
          <div>
            <p className="text-sm font-medium text-textSecondary">Monthly Overview</p>
            <p className="mt-2 text-4xl font-bold text-primaryDark">
              {formatCurrency(monthlyExpense)}
            </p>
            <p className="mt-1 text-sm text-textSecondary">
              Income {formatCurrency(monthlyIncome)} · Net{" "}
              <span
                className={
                  monthlyNet >= 0
                    ? "font-semibold text-accentGreen"
                    : "font-semibold text-red-500"
                }
              >
                {formatCurrency(monthlyNet)}
              </span>
            </p>
            {hasBudget ? (
              <p className="mt-1 text-sm text-textSecondary">
                {progress?.overBudget
                  ? `Over budget by ${formatCurrency(
                      Math.max(0, (progress?.totalSpent || 0) - monthlyBudget)
                    )}`
                  : `${formatCurrency(remaining)} remaining of ${formatCurrency(
                      monthlyBudget
                    )} budget`}
              </p>
            ) : (
              <p className="mt-1 text-sm text-textSecondary">
                No budget set —{" "}
                <Link
                  to="/budgets"
                  className="font-medium text-accentGreen hover:text-primaryMid"
                >
                  plan this month
                </Link>
              </p>
            )}
          </div>
          <div className="mt-6 flex items-center justify-center">
            <CircularProgress
              percent={hasBudget ? spendPercent : 0}
              label={hasBudget ? (progress?.overBudget ? "Over" : "of budget") : "No budget"}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-textPrimary">Quick Actions</h2>
        <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <QuickAction to="/expenses/add" icon="+" label="Add expense" />
          <QuickAction to="/incomes/add" icon="↑" label="Add income" />
          <QuickAction to="/budgets" icon="◎" label="Budgets" />
          <QuickAction to="/wealth" icon="◆" label="Wealth" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-textPrimary">Wealth snapshot</h2>
            <Link
              to="/wealth"
              className="text-sm font-medium text-accentGreen hover:text-primaryMid"
            >
              Manage
            </Link>
          </div>
          <p className="mt-2 text-3xl font-bold text-primaryDark">
            {formatCurrency(wealthTotal)}
          </p>
          <p className="mt-1 text-sm text-textSecondary">
            Saved {formatCurrency(savingStats?.totalSaved)} · Invested value{" "}
            {formatCurrency(investmentStats?.totalCurrent)}
          </p>
          <p className="mt-1 text-xs text-textSecondary">
            Portfolio return {investmentStats?.returnPercent || 0}% ·{" "}
            {savingStats?.totalGoals || 0} saving goal
            {(savingStats?.totalGoals || 0) === 1 ? "" : "s"}
          </p>
        </div>
        <div className="card p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-textPrimary">This month</h2>
          <p className="mt-2 text-3xl font-bold text-primaryDark">
            {formatCurrency(monthlyNet)}
          </p>
          <p className="mt-1 text-sm text-textSecondary">
            Net = income − expenses
          </p>
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-textPrimary">Recent Expenses</h2>
          <Link
            to="/expenses"
            className="text-sm font-medium text-accentGreen hover:text-primaryMid"
          >
            View all
          </Link>
        </div>

        {loading && !expenses.length ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-surfaceGray" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <NoDataFound className="py-10" />
        ) : (
          <ul className="divide-y divide-border/60">
            {expenses.map((expense) => (
              <li
                key={expense._id}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${getCategoryAvatarClass(
                    colorMap[expense.category] || expense.category
                  )}`}
                >
                  {expense.category?.[0] || "₹"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-textPrimary">
                    {expense.title}
                  </p>
                  <p className="text-xs text-textSecondary">
                    {expense.category} • {expense.paymentMode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-textPrimary">
                    {formatCurrency(expense.amount)}
                  </p>
                  <p className="text-xs text-textSecondary">
                    {formatExpenseDate(expense.date)} ·{" "}
                    {formatExpenseTime(expense.createdAt || expense.date)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
