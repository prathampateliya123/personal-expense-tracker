/**
 * pages/Dashboard.jsx
 */

import { useSelector } from "react-redux";
import PageHeader from "../components/dashboard/PageHeader";
import { getPageMeta } from "../dashboard/navConfig";

const quickStats = [
  {
    label: "Total Balance",
    value: "₹0",
    change: "—",
    color: "text-brand-600",
    bg: "bg-brand-50",
    ring: "ring-brand-100",
  },
  {
    label: "This Month",
    value: "₹0",
    change: "No expenses yet",
    color: "text-accent-expense",
    bg: "bg-rose-50",
    ring: "ring-rose-100",
  },
  {
    label: "Savings Goal",
    value: "0%",
    change: "Set a goal",
    color: "text-accent-info",
    bg: "bg-sky-50",
    ring: "ring-sky-100",
  },
];

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const pageInfo = getPageMeta("/dashboard");

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageInfo.title}
        subtitle={pageInfo.subtitle}
        breadcrumb={pageInfo.breadcrumb}
      />

      {/* Welcome banner */}
      <div className="card overflow-hidden">
        <div className="relative bg-brand-gradient px-6 py-8 sm:px-8 sm:py-10">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.2),transparent)]" />
          <div className="relative">
            <p className="text-sm font-medium text-brand-100">Welcome back</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {user?.name ? `Hello, ${user.name.split(" ")[0]}!` : "Hello!"}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-brand-100/80">
              Track expenses, set budgets, and reach your savings goals — all
              from one dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickStats.map(({ label, value, change, color, bg, ring }) => (
          <div
            key={label}
            className={`card p-5 ring-1 ring-inset ${ring} transition hover:shadow-md`}
          >
            <div className={`mb-4 inline-flex rounded-lg ${bg} px-2.5 py-1`}>
              <span className={`text-xs font-semibold ${color}`}>{label}</span>
            </div>
            <p className="text-2xl font-bold text-ink-900">{value}</p>
            <p className="mt-1 text-xs text-ink-400">{change}</p>
          </div>
        ))}
      </div>

      {/* Placeholder modules */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card flex min-h-[200px] flex-col items-center justify-center p-8 text-center">
          <p className="text-sm font-semibold text-ink-700">
            Recent Transactions
          </p>
          <p className="mt-1 text-xs text-ink-400">
            Expense module coming soon
          </p>
        </div>
        <div className="card flex min-h-[200px] flex-col items-center justify-center p-8 text-center">
          <p className="text-sm font-semibold text-ink-700">
            Spending Overview
          </p>
          <p className="mt-1 text-xs text-ink-400">
            Reports module coming soon
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
