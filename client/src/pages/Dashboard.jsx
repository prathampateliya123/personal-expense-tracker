/**
 * pages/Dashboard.jsx
 * Fintech-style overview — hero spend, monthly stats, quick actions, recent txns.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CircularProgress from "../components/dashboard/CircularProgress";
import {
  formatCurrency,
  CATEGORY_AVATAR_BG,
  formatExpenseDate,
  formatExpenseTime,
} from "../config/expenseConstants";
import { fetchExpenses, fetchExpenseStats } from "../redux/slices/expenseSlice";

const QuickAction = ({ to, icon, label, disabled }) => {
  if (disabled) {
    return (
      <div className="quick-action-btn cursor-not-allowed opacity-50">
        <span className="text-xl">{icon}</span>
        <span className="text-xs font-medium text-textSecondary">{label}</span>
      </div>
    );
  }

  return (
    <Link to={to} className="quick-action-btn">
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium text-textPrimary">{label}</span>
    </Link>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { expenses, stats, loading } = useSelector((state) => state.expenses);
  const [todaySpend, setTodaySpend] = useState(0);

  const firstName = user?.name?.split(" ")[0] || "there";
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const loadDashboard = async () => {
      const todayResult = await dispatch(
        fetchExpenses({
          category: "",
          paymentMode: "",
          startDate: today,
          endDate: today,
          search: "",
          page: 1,
          limit: 50,
          sortBy: "date",
        })
      );
      if (fetchExpenses.fulfilled.match(todayResult)) {
        setTodaySpend(todayResult.payload.totalAmount || 0);
      }

      await dispatch(fetchExpenseStats());
      await dispatch(
        fetchExpenses({
          category: "",
          paymentMode: "",
          startDate: "",
          endDate: "",
          search: "",
          page: 1,
          limit: 5,
          sortBy: "date",
        })
      );
    };

    loadDashboard();
  }, [dispatch, today]);

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
        {/* Hero — Today's Spend */}
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

        {/* Monthly overview */}
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

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-textPrimary">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <QuickAction to="/expenses/add" icon="+" label="Add" />
          <QuickAction icon="🔔" label="Alerts" disabled />
          <QuickAction icon="📋" label="Reports" disabled />
        </div>
      </div>

      {/* Recent transactions */}
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
