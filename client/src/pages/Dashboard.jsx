/**
 * pages/Dashboard.jsx
 * Fintech-style overview — TanStack Query for dashboard data.
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useUserProfile } from "../context/UserProfileContext";
import CircularProgress from "../components/dashboard/CircularProgress";
import {
  formatCurrency,
  CATEGORY_AVATAR_BG,
  formatExpenseDate,
  formatExpenseTime,
} from "../utils/expenseConstants";
import expenseService, { INITIAL_EXPENSE_FILTERS } from "../services/expenseService";
import { expenseKeys } from "../services/queryKeys";

const QuickAction = ({ to, icon, label }) => (
  <Link to={to} className="quick-action-btn">
    <span className="text-xl">{icon}</span>
    <span className="text-xs font-medium text-textPrimary">{label}</span>
  </Link>
);

const Dashboard = () => {
  const { user } = useUserProfile();
  const today = new Date().toISOString().split("T")[0];

  const todayFilters = useMemo(
    () => ({
      ...INITIAL_EXPENSE_FILTERS,
      startDate: today,
      endDate: today,
      limit: 50,
    }),
    [today]
  );

  const recentFilters = useMemo(
    () => ({
      ...INITIAL_EXPENSE_FILTERS,
      limit: 5,
    }),
    []
  );

  const statsQuery = useQuery({
    queryKey: expenseKeys.stats(),
    queryFn: async () => {
      const data = await expenseService.getStats();
      return data.stats;
    },
  });

  const todayQuery = useQuery({
    queryKey: expenseKeys.list(todayFilters),
    queryFn: () => expenseService.list(todayFilters),
  });

  const recentQuery = useQuery({
    queryKey: expenseKeys.list(recentFilters),
    queryFn: () => expenseService.list(recentFilters),
  });

  const firstName = user?.name?.split(" ")[0] || "there";
  const stats = statsQuery.data;
  const todaySpend = todayQuery.data?.totalAmount || 0;
  const expenses = recentQuery.data?.expenses ?? [];
  const loading = recentQuery.isLoading;

  const monthlyTotal = stats?.totalAmount || 0;
  const monthlyBudget = Math.max(monthlyTotal * 1.25, 10000);
  const spendPercent = Math.min(
    100,
    Math.round((monthlyTotal / monthlyBudget) * 100)
  );
  const remaining = Math.max(0, monthlyBudget - monthlyTotal);

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 pb-24 lg:pb-6">
      <div>
        <p className="text-sm text-textSecondary">Welcome back</p>
        <h1 className="text-2xl font-bold text-textPrimary sm:text-3xl">
          Hello, {firstName}!
        </h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="gradient-green-card rounded-3xl p-6 text-white shadow-soft sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Today&apos;s Spend</p>
              <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
                {formatCurrency(todaySpend)}
              </p>
            </div>
            <span className="rounded-xl bg-successBg px-3 py-1 text-xs font-semibold text-successText">
              {stats?.count ? `${stats.count} this month` : "On track"}
            </span>
          </div>
          <p className="mt-4 text-sm text-white/70">
            Keep your daily spending steady for better monthly savings.
          </p>
        </div>

        <div className="card flex flex-col justify-between p-6 sm:p-8">
          <div>
            <p className="text-sm font-medium text-textSecondary">Monthly Overview</p>
            <p className="mt-2 text-4xl font-bold text-primaryDark">
              {formatCurrency(monthlyTotal)}
            </p>
            <p className="mt-1 text-sm text-textSecondary">
              {remaining > 0
                ? `${formatCurrency(remaining)} remaining of budget`
                : "Budget overview"}
            </p>
          </div>
          <div className="mt-6 flex items-center justify-center">
            <CircularProgress percent={spendPercent} label="of budget" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-textPrimary">Quick Actions</h2>
        <div className="grid max-w-xs grid-cols-1 gap-3 sm:gap-4">
          <QuickAction to="/expenses/add" icon="+" label="Add expense" />
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-textPrimary">Recent Transactions</h2>
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
          <div className="py-10 text-center">
            <p className="text-sm text-textSecondary">No transactions yet.</p>
            <Link to="/expenses/add" className="mt-2 inline-block text-sm font-medium text-accentGreen">
              Add your first expense
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {expenses.map((expense) => (
              <li
                key={expense._id}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
                    CATEGORY_AVATAR_BG[expense.category] ||
                    CATEGORY_AVATAR_BG.Other
                  }`}
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
                    {formatExpenseDate(expense.date)} · {formatExpenseTime(expense.createdAt || expense.date)}
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
