/**
 * pages/Dashboard.jsx
 * Default dashboard placeholder with branded welcome section.
 */

import { useSelector } from "react-redux";

const quickStats = [
  { label: "Total Balance", value: "—", color: "text-brand-600", bg: "bg-brand-50" },
  { label: "This Month", value: "—", color: "text-accent-expense", bg: "bg-rose-50" },
  { label: "Savings Goal", value: "—", color: "text-accent-info", bg: "bg-sky-50" },
];

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="bg-brand-gradient px-8 py-10">
          <p className="text-sm font-medium text-brand-100">Good to see you</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
            {user?.name ? `Hello, ${user.name.split(" ")[0]}!` : "Hello!"}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-brand-100/80">
            Your expense tracker is ready. Modules like expenses, budgets, and
            goals will appear here as you build them.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {quickStats.map(({ label, value, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`mb-3 inline-flex rounded-lg ${bg} px-2.5 py-1`}>
              <span className={`text-xs font-semibold ${color}`}>{label}</span>
            </div>
            <p className="text-2xl font-bold text-ink-900">{value}</p>
            <p className="mt-1 text-xs text-ink-400">Coming soon</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
