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

const CHART_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

/** Loading skeleton for summary cards */
const SummaryCardSkeleton = () => (
  <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="h-4 w-24 rounded bg-gray-200" />
      <div className="h-10 w-10 rounded-lg bg-gray-200" />
    </div>
    <div className="mt-4 h-8 w-32 rounded bg-gray-200" />
    <div className="mt-2 h-3 w-20 rounded bg-gray-100" />
  </div>
);

/** Loading skeleton for chart panels */
const ChartSkeleton = () => (
  <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="mb-4 h-5 w-40 rounded bg-gray-200" />
    <div className="h-64 rounded-lg bg-gray-100" />
  </div>
);

const SummaryCard = ({ title, value, subtitle, icon, colorClass, iconBg }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
        {icon}
      </div>
    </div>
    <p className={`mt-3 text-3xl font-bold ${colorClass}`}>{value}</p>
    {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
  </div>
);

const EmptyChart = ({ message = "No data yet" }) => (
  <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
    <p className="text-sm text-gray-400">{message}</p>
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
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
              colorClass="text-green-600"
              iconBg="bg-green-50"
              icon={
                <svg
                  className="h-5 w-5 text-green-600"
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
              colorClass="text-red-600"
              iconBg="bg-red-50"
              icon={
                <svg
                  className="h-5 w-5 text-red-600"
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
                  ? "text-indigo-600"
                  : "text-orange-600"
              }
              iconBg="bg-indigo-50"
              icon={
                <svg
                  className="h-5 w-5 text-indigo-600"
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
        {/* Pie chart — category breakdown */}
        {loading && categoryBreakdown.length === 0 ? (
          <ChartSkeleton />
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">
              Expense by Category
            </h2>
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
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-gray-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        )}

        {/* Line chart — monthly trend */}
        {loading && monthlyTrend.length === 0 ? (
          <ChartSkeleton />
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">
              Income vs Expense Trend
            </h2>
            {hasTrendData ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickFormatter={(val) =>
                      val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
                    }
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs text-gray-600">{value}</span>
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#22c55e" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#ef4444" }}
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
