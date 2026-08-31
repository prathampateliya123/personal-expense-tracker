/**
 * pages/Dashboard.jsx
 * Analytics dashboard with summary cards, pie chart, and line chart.
 * Fetches data via Redux and shows loading skeletons while loading.
 */

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchDashboardData, clearError } from "../redux/dashboardSlice";
import {
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
  CHART_AXIS_TICK,
  CHART_AXIS_LINE,
  CHART_GRID,
  INCOME_LINE_COLOR,
  EXPENSE_LINE_COLOR,
} from "../utils/themeConstants";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

/** Loading skeleton for summary cards */
const SummaryCardSkeleton = () => (
  <div className="card animate-pulse p-6">
    <div className="flex items-center justify-between">
      <div className="h-4 w-24 rounded bg-border" />
      <div className="h-10 w-10 rounded-lg bg-border" />
    </div>
    <div className="mt-4 h-8 w-32 rounded bg-border" />
    <div className="mt-2 h-3 w-20 rounded bg-border/60" />
  </div>
);

/** Loading skeleton for chart panels */
const ChartSkeleton = () => (
  <div className="card animate-pulse p-6">
    <div className="mb-4 h-5 w-40 rounded bg-border" />
    <div className="h-64 rounded-xl bg-background" />
  </div>
);

const SummaryCard = ({ title, value, subtitle, icon, colorClass, iconBg }) => (
  <div className="card-glow">
    <div className="card-glow-inner">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-textSecondary">{title}</p>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
        >
          {icon}
        </div>
      </div>
      <p className={`mt-3 text-3xl font-bold tracking-heading ${colorClass}`}>
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-xs text-textMuted">{subtitle}</p>
      )}
    </div>
  </div>
);

const EmptyChart = ({ message = "No data yet" }) => (
  <div className="flex h-64 items-center justify-center rounded-xl bg-background">
    <p className="text-sm text-textMuted">{message}</p>
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { summary, categoryBreakdown, monthlyTrend, loading, error } =
    useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const monthData = summary?.currentMonth;
  const hasCategoryData =
    categoryBreakdown.length > 0 &&
    categoryBreakdown.some((item) => item.total > 0);
  const hasTrendData =
    monthlyTrend.length > 0 &&
    monthlyTrend.some((item) => item.income > 0 || item.expense > 0);

  const pieData = categoryBreakdown.map((item) => ({
    name: item.category,
    value: item.total,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-heading">Dashboard</h1>
        <p className="page-subheading">
          Overview of your financial activity
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {loading && !summary ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          <>
            <SummaryCard
              title="Total Income"
              value={formatCurrency(monthData?.income)}
              subtitle={`All-time: ${formatCurrency(summary?.allTime?.income)}`}
              colorClass="text-income"
              iconBg="bg-income/15"
              icon={
                <svg
                  className="h-5 w-5 text-income"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                  />
                </svg>
              }
            />
            <SummaryCard
              title="Total Expense"
              value={formatCurrency(monthData?.expense)}
              subtitle={`All-time: ${formatCurrency(summary?.allTime?.expense)}`}
              colorClass="text-expense"
              iconBg="bg-expense/15"
              icon={
                <svg
                  className="h-5 w-5 text-expense"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 13l-5 5m0 0l-5-5m5 5V6"
                  />
                </svg>
              }
            />
            <SummaryCard
              title="Balance"
              value={formatCurrency(monthData?.balance)}
              subtitle={`All-time: ${formatCurrency(summary?.allTime?.balance)}`}
              colorClass={
                (monthData?.balance ?? 0) >= 0
                  ? "text-secondary"
                  : "text-warning"
              }
              iconBg="bg-secondary/15"
              icon={
                <svg
                  className="h-5 w-5 text-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading && categoryBreakdown.length === 0 ? (
          <ChartSkeleton />
        ) : (
          <div className="card p-6">
            <h2 className="section-heading mb-4">Expense by Category</h2>
            {hasCategoryData ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={CHART_TOOLTIP_STYLE}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-textSecondary">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        )}

        {loading && monthlyTrend.length === 0 ? (
          <ChartSkeleton />
        ) : (
          <div className="card p-6">
            <h2 className="section-heading mb-4">Income vs Expense Trend</h2>
            {hasTrendData ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid {...CHART_GRID} />
                  <XAxis
                    dataKey="month"
                    tick={CHART_AXIS_TICK}
                    axisLine={CHART_AXIS_LINE}
                  />
                  <YAxis
                    tick={CHART_AXIS_TICK}
                    axisLine={CHART_AXIS_LINE}
                    tickFormatter={(val) =>
                      val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
                    }
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={CHART_TOOLTIP_STYLE}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs text-textSecondary">{value}</span>
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke={INCOME_LINE_COLOR}
                    strokeWidth={2}
                    dot={{ r: 4, fill: INCOME_LINE_COLOR }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke={EXPENSE_LINE_COLOR}
                    strokeWidth={2}
                    dot={{ r: 4, fill: EXPENSE_LINE_COLOR }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
