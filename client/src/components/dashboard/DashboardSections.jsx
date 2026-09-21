import { Link } from "react-router-dom";
import NoDataFound from "../ui/NoDataFound";
import {
  IconPlus,
  IconIncomes,
  IconBudgets,
  IconWealth,
  IconReports,
  IconTrip,
  IconSubscriptions,
  IconCalendarDays,
  IconChevronRight,
} from "../ui/Icons";
import { formatCurrency, formatExpenseDate, formatExpenseTime } from "../../utils/formatters";
import { getCategoryAvatarClass } from "../../utils/categoryColors";

const ALLOC_COLORS = [
  "#235347",
  "#8EB69B",
  "#0B2B26",
  "#51A38B",
  "#163832",
  "#BFD9C8",
];

export const DashboardHero = ({
  firstName,
  periodLabel,
  todaySpend,
  todayIncome,
  monthlyNet,
  savingsRate,
  expenseCount,
}) => (
  <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primaryDark via-primaryMid to-primaryLight text-white">
    <div
      className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accentSage/20 blur-3xl"
      aria-hidden
    />
    <div
      className="pointer-events-none absolute -bottom-28 left-8 h-52 w-52 rounded-full bg-accentGreen/25 blur-3xl"
      aria-hidden
    />

    <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.35fr_1fr] lg:items-end">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accentSage/90">
          Dashboard · {periodLabel}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Hello, {firstName}
        </h1>
        <p className="mt-2 max-w-lg text-sm text-white/65">
          Your money overview — spend, income, budget, wealth, and live
          activity in one place.
        </p>

        <div className="mt-6 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">
              Today spend
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">
              {formatCurrency(todaySpend)}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">
              Today income
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-accentSage sm:text-2xl">
              {formatCurrency(todayIncome)}
            </p>
          </div>
          <div className="col-span-2 rounded-lg border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm sm:col-span-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">
              Month net
            </p>
            <p
              className={`mt-1 text-xl font-bold tabular-nums sm:text-2xl ${
                monthlyNet >= 0 ? "text-accentSage" : "text-red-300"
              }`}
            >
              {formatCurrency(monthlyNet)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">
          Savings rate
        </p>
        <p className="mt-1 text-4xl font-bold tabular-nums text-accentSage">
          {savingsRate}%
        </p>
        <p className="mt-2 text-sm text-white/60">
          {expenseCount || 0} expenses logged this month · net as % of income
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accentSage"
            style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
          />
        </div>
        <Link
          to="/reports"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accentSage hover:text-white"
        >
          Open full reports
          <IconChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </div>
);

export const DashboardKpis = ({
  monthlyIncome,
  monthlyExpense,
  monthlyNet,
  wealthTotal,
  budgetUsed,
  hasBudget,
}) => {
  const cards = [
    {
      label: "Income",
      value: formatCurrency(monthlyIncome),
      hint: "This month",
      tone: "text-accentGreen",
    },
    {
      label: "Expense",
      value: formatCurrency(monthlyExpense),
      hint: "This month",
      tone: "text-red-500",
    },
    {
      label: "Net",
      value: formatCurrency(monthlyNet),
      hint: monthlyNet >= 0 ? "Surplus" : "Deficit",
      tone: monthlyNet >= 0 ? "text-primaryDark" : "text-red-500",
    },
    {
      label: "Wealth",
      value: formatCurrency(wealthTotal),
      hint: "Savings + investments",
      tone: "text-primaryDark",
    },
    {
      label: "Budget used",
      value: hasBudget ? `${budgetUsed}%` : "—",
      hint: hasBudget ? "Of monthly plan" : "No budget set",
      tone: "text-primaryDark",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-border bg-white px-4 py-4"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-textSecondary">
            {card.label}
          </p>
          <p className={`mt-1 text-2xl font-bold tabular-nums ${card.tone}`}>
            {card.value}
          </p>
          <p className="mt-0.5 text-xs text-textSecondary">{card.hint}</p>
        </div>
      ))}
    </div>
  );
};

export const DashboardQuickActions = () => {
  const actions = [
    { to: "/expenses/add", label: "Add expense", icon: IconPlus },
    { to: "/incomes/add", label: "Add income", icon: IconIncomes },
    { to: "/budgets", label: "Budgets", icon: IconBudgets },
    { to: "/reports", label: "Reports", icon: IconReports },
    { to: "/timeline", label: "Timeline", icon: IconCalendarDays },
    { to: "/trips", label: "Trips", icon: IconTrip },
    { to: "/subscriptions", label: "Subscriptions", icon: IconSubscriptions },
    { to: "/wealth", label: "Wealth", icon: IconWealth },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-textPrimary">Quick actions</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="group flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-white px-3 py-4 text-center transition hover:border-accentGreen/40 hover:bg-successBg/50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surfaceLight text-accentGreen transition group-hover:bg-white">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold text-textPrimary">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export const DashboardCashFlowChart = ({ series = [] }) => {
  const activeDays = series.filter(
    (row) => (row.income || 0) > 0 || (row.expense || 0) > 0
  );

  let running = 0;
  const cumulative = series.map((row) => {
    running += (row.income || 0) - (row.expense || 0);
    return { ...row, cumulative: Math.round(running * 100) / 100 };
  });

  const totals = series.reduce(
    (acc, row) => ({
      income: acc.income + (row.income || 0),
      expense: acc.expense + (row.expense || 0),
    }),
    { income: 0, expense: 0 }
  );
  const net = Math.round((totals.income - totals.expense) * 100) / 100;
  const flowMax = Math.max(totals.income, totals.expense, 1);

  const width = 560;
  const height = 168;
  const padX = 12;
  const padY = 16;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const cumValues = cumulative.map((r) => r.cumulative);
  const minY = Math.min(0, ...cumValues);
  const maxY = Math.max(0, ...cumValues);
  const rangeY = Math.max(maxY - minY, 1);

  const xAt = (index) =>
    series.length <= 1
      ? padX + chartW / 2
      : padX + (index / (series.length - 1)) * chartW;
  const yAt = (value) =>
    padY + chartH - ((value - minY) / rangeY) * chartH;

  const zeroY = yAt(0);
  const linePoints = cumulative
    .map((row, i) => `${xAt(i)},${yAt(row.cumulative)}`)
    .join(" ");
  const areaPath =
    cumulative.length > 0
      ? `M ${xAt(0)} ${zeroY} L ${cumulative
          .map((row, i) => `${xAt(i)} ${yAt(row.cumulative)}`)
          .join(" L ")} L ${xAt(cumulative.length - 1)} ${zeroY} Z`
      : "";

  const peak = activeDays.reduce(
    (best, row) =>
      (row.income || 0) + (row.expense || 0) >
      (best.income || 0) + (best.expense || 0)
        ? row
        : best,
    activeDays[0] || null
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white">
      <div className="flex flex-col gap-2 border-b border-border bg-surfaceLight/60 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-textPrimary">
            Cash flow pulse
          </h2>
          <p className="text-xs text-textSecondary">
            Cumulative net line · activity nodes on spend days
          </p>
        </div>
        {peak ? (
          <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-textSecondary ring-1 ring-border">
            Peak day {peak.label}:{" "}
            {formatCurrency((peak.income || 0) + (peak.expense || 0))}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-5 p-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-successBg/70 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-textSecondary">
              Income
            </p>
            <p className="text-lg font-bold tabular-nums text-accentGreen">
              {formatCurrency(totals.income)}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-accentGreen"
                style={{
                  width: `${Math.round((totals.income / flowMax) * 100)}%`,
                }}
              />
            </div>
          </div>
          <div className="rounded-lg bg-red-50 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-textSecondary">
              Expense
            </p>
            <p className="text-lg font-bold tabular-nums text-red-500">
              {formatCurrency(totals.expense)}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-red-400"
                style={{
                  width: `${Math.round((totals.expense / flowMax) * 100)}%`,
                }}
              />
            </div>
          </div>
          <div className="rounded-lg bg-surfaceGray px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-textSecondary">
              Net pulse
            </p>
            <p
              className={`text-lg font-bold tabular-nums ${
                net >= 0 ? "text-primaryDark" : "text-red-500"
              }`}
            >
              {formatCurrency(net)}
            </p>
            <p className="mt-1 text-[11px] text-textSecondary">
              {activeDays.length} active day{activeDays.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-b from-surfaceLight/80 to-white p-3">
          {series.length ? (
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="h-[168px] w-full"
              role="img"
              aria-label="Cumulative cash flow chart"
            >
              <defs>
                <linearGradient id="cashArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#235347" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#235347" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <line
                x1={padX}
                x2={width - padX}
                y1={zeroY}
                y2={zeroY}
                stroke="#BFD9C8"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              {areaPath ? (
                <path d={areaPath} fill="url(#cashArea)" />
              ) : null}
              {linePoints ? (
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="#051F20"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ) : null}
              {cumulative.map((row, i) => {
                const hasActivity =
                  (row.income || 0) > 0 || (row.expense || 0) > 0;
                if (!hasActivity) return null;
                const cx = xAt(i);
                const cy = yAt(row.cumulative);
                const mostlyExpense = (row.expense || 0) >= (row.income || 0);
                return (
                  <g key={row.key}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r="5.5"
                      fill={mostlyExpense ? "#F87171" : "#8EB69B"}
                      stroke="#fff"
                      strokeWidth="2"
                    />
                    <title>
                      Day {row.label}: In {formatCurrency(row.income)} · Out{" "}
                      {formatCurrency(row.expense)} · Net{" "}
                      {formatCurrency(row.cumulative)}
                    </title>
                  </g>
                );
              })}
            </svg>
          ) : (
            <p className="py-12 text-center text-sm text-textSecondary">
              No cash flow yet this month
            </p>
          )}
        </div>

        {activeDays.length ? (
          <div className="flex flex-wrap gap-2">
            {activeDays.slice(0, 8).map((row) => (
              <div
                key={row.key}
                className="rounded-lg border border-border bg-surfaceLight/50 px-2.5 py-1.5 text-xs"
              >
                <span className="font-semibold text-textPrimary">
                  Day {row.label}
                </span>
                <span className="mx-1.5 text-textSecondary">·</span>
                <span className="text-accentGreen">
                  +{formatCurrency(row.income || 0)}
                </span>
                <span className="mx-1 text-textSecondary">/</span>
                <span className="text-red-500">
                  −{formatCurrency(row.expense || 0)}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const DashboardBudgetCard = ({ hasBudget, progress, monthlyBudget }) => {
  const percent = Math.min(100, Math.max(0, progress?.percentUsed || 0));
  const remaining = progress?.remaining || 0;
  const spent = progress?.totalSpent || 0;
  const allocations = (progress?.allocations || [])
    .slice()
    .sort((a, b) => (b.amount || 0) - (a.amount || 0));

  const size = 168;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const arcs = allocations.length
    ? allocations.map((row, index) => {
        const share =
          monthlyBudget > 0 ? (row.amount || 0) / monthlyBudget : 0;
        const length = share * circumference;
        const item = {
          ...row,
          color: ALLOC_COLORS[index % ALLOC_COLORS.length],
          dasharray: `${length} ${circumference - length}`,
          dashoffset: -offset,
        };
        offset += length;
        return item;
      })
    : [
        {
          category: "Unallocated",
          color: "#E8F5EB",
          dasharray: `${circumference} 0`,
          dashoffset: 0,
          amount: monthlyBudget,
          spent: 0,
        },
      ];

  const spentArc = (percent / 100) * circumference;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white">
      <div className="flex items-center justify-between border-b border-border bg-surfaceLight/60 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-textPrimary">
            Budget reservoir
          </h2>
          <p className="text-xs text-textSecondary">
            Allocation ring + remaining tank
          </p>
        </div>
        <Link
          to="/budgets"
          className="text-sm font-semibold text-accentGreen hover:text-primaryMid"
        >
          Manage
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-5">
        {hasBudget ? (
          <>
            <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="relative mx-auto" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="none"
                    stroke="#E8F5EB"
                    strokeWidth={stroke}
                  />
                  {arcs.map((arc) => (
                    <circle
                      key={arc.category}
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill="none"
                      stroke={arc.color}
                      strokeWidth={stroke}
                      strokeDasharray={arc.dasharray}
                      strokeDashoffset={arc.dashoffset}
                      strokeLinecap="butt"
                    />
                  ))}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius - stroke - 4}
                    fill="none"
                    stroke="#DAF1DE"
                    strokeWidth="6"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius - stroke - 4}
                    fill="none"
                    stroke={progress?.overBudget ? "#F87171" : "#051F20"}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${spentArc * ((radius - stroke - 4) / radius)} ${
                      2 * Math.PI * (radius - stroke - 4)
                    }`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-primaryDark">{percent}%</p>
                  <p className="text-[11px] text-textSecondary">drawn</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-textSecondary">
                  Remaining tank
                </p>
                <div className="mt-2 flex h-28 overflow-hidden rounded-lg border border-border bg-surfaceGray">
                  <div
                    className="flex items-end justify-center bg-gradient-to-t from-accentGreen to-accentSage transition-all duration-700"
                    style={{
                      width: `${Math.max(8, 100 - percent)}%`,
                    }}
                  >
                    <span className="mb-2 rotate-0 px-1 text-[10px] font-bold text-white">
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                  <div
                    className="flex items-end justify-center bg-primaryDark/10"
                    style={{ width: `${percent}%` }}
                  >
                    <span className="mb-2 px-1 text-[10px] font-bold text-primaryDark/70">
                      {formatCurrency(spent)}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-textSecondary">
                  <span className="font-bold text-primaryDark">
                    {formatCurrency(spent)}
                  </span>{" "}
                  of {formatCurrency(monthlyBudget)} used
                </p>
                <p
                  className={`mt-1 text-sm font-semibold ${
                    progress?.overBudget ? "text-red-500" : "text-accentGreen"
                  }`}
                >
                  {progress?.overBudget
                    ? `Over by ${formatCurrency(
                        Math.max(0, spent - monthlyBudget)
                      )}`
                    : `${formatCurrency(remaining)} still available`}
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">
                Allocation mix
              </p>
              <div className="flex flex-wrap gap-2">
                {allocations.slice(0, 5).map((row, index) => (
                  <div
                    key={row.category}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-surfaceLight/50 px-2.5 py-1.5 text-xs"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          ALLOC_COLORS[index % ALLOC_COLORS.length],
                      }}
                    />
                    <span className="font-medium text-textPrimary">
                      {row.category}
                    </span>
                    <span className="tabular-nums text-textSecondary">
                      {formatCurrency(row.spent)}/{formatCurrency(row.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-textSecondary">
              No budget set for this month
            </p>
            <Link to="/budgets" className="btn-primary mt-4 text-sm">
              Create budget
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export const DashboardCategoryCard = ({ items = [], colorMap = {} }) => {
  const max = Math.max(1, ...items.map((row) => row.total || 0));
  const total = items.reduce((sum, row) => sum + (row.total || 0), 0);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white">
      <div className="flex items-center justify-between border-b border-border bg-surfaceLight/60 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-textPrimary">
            Spend by category
          </h2>
          <p className="text-xs text-textSecondary">
            {formatCurrency(total)} this month
          </p>
        </div>
        <Link
          to="/reports"
          className="text-sm font-semibold text-accentGreen hover:text-primaryMid"
        >
          Details
        </Link>
      </div>
      <div className="flex-1 space-y-3 p-5">
        {items.length ? (
          items.slice(0, 6).map((row, index) => (
            <div key={row.category} className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${getCategoryAvatarClass(
                  colorMap[row.category] || row.category
                )}`}
              >
                {row.category?.[0] || "#"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex justify-between gap-2 text-sm">
                  <span className="truncate font-medium text-textPrimary">
                    {row.category}
                  </span>
                  <span className="shrink-0 font-bold tabular-nums text-primaryDark">
                    {formatCurrency(row.total)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surfaceGray">
                  <div
                    className="h-full rounded-full bg-accentGreen"
                    style={{
                      width: `${Math.max(
                        8,
                        Math.round((row.total / max) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <span className="text-[11px] font-semibold text-textSecondary">
                #{index + 1}
              </span>
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-sm text-textSecondary">
            No expenses this month yet
          </p>
        )}
      </div>
    </div>
  );
};

export const DashboardModuleGrid = ({
  wealthTotal,
  savingStats,
  investmentStats,
  subscriptionStats,
  tripStats,
}) => {
  const modules = [
    {
      to: "/wealth",
      label: "Wealth",
      value: formatCurrency(wealthTotal),
      hint: `Saved ${formatCurrency(savingStats?.totalSaved || 0)} · Invested ${formatCurrency(investmentStats?.totalCurrent || 0)}`,
      meta: `Return ${investmentStats?.returnPercent || 0}%`,
      icon: IconWealth,
    },
    {
      to: "/subscriptions",
      label: "Subscriptions",
      value: formatCurrency(subscriptionStats?.monthlyCost || 0),
      hint: `${subscriptionStats?.active || 0} active · ${subscriptionStats?.dueSoon || 0} due soon`,
      meta: `Yearly ${formatCurrency(subscriptionStats?.yearlyCost || 0)}`,
      icon: IconSubscriptions,
    },
    {
      to: "/trips",
      label: "Trips",
      value: formatCurrency(tripStats?.totalSpend || 0),
      hint: `${tripStats?.activeTrips || 0} active · ${tripStats?.unsettledTrips || 0} unsettled`,
      meta: `${tripStats?.totalTrips || 0} total trips`,
      icon: IconTrip,
    },
    {
      to: "/timeline",
      label: "Timeline",
      value: "Day view",
      hint: "Chronological spend with calendar",
      meta: "Open timeline",
      icon: IconCalendarDays,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {modules.map((mod) => {
        const Icon = mod.icon;
        return (
          <Link
            key={mod.to}
            to={mod.to}
            className="group rounded-lg border border-border bg-white p-5 transition hover:border-accentGreen/40 hover:bg-successBg/30"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surfaceLight text-accentGreen">
                <Icon className="h-5 w-5" />
              </span>
              <IconChevronRight className="h-4 w-4 text-textSecondary opacity-0 transition group-hover:opacity-100" />
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-textSecondary">
              {mod.label}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-primaryDark">
              {mod.value}
            </p>
            <p className="mt-1 text-xs text-textSecondary">{mod.hint}</p>
            <p className="mt-2 text-xs font-medium text-accentGreen">
              {mod.meta}
            </p>
          </Link>
        );
      })}
    </div>
  );
};

export const DashboardRecentExpenses = ({
  expenses = [],
  loading = false,
  colorMap = {},
}) => (
  <div className="overflow-hidden rounded-lg border border-border bg-white">
    <div className="flex items-center justify-between border-b border-border bg-surfaceLight/60 px-5 py-4">
      <div>
        <h2 className="text-base font-semibold text-textPrimary">
          Recent expenses
        </h2>
        <p className="text-xs text-textSecondary">Latest activity</p>
      </div>
      <Link
        to="/expenses"
        className="inline-flex items-center gap-1 text-sm font-semibold text-accentGreen hover:text-primaryMid"
      >
        View all
        <IconChevronRight className="h-4 w-4" />
      </Link>
    </div>

    {loading && !expenses.length ? (
      <div className="space-y-3 p-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-surfaceGray" />
        ))}
      </div>
    ) : expenses.length === 0 ? (
      <div className="p-6">
        <NoDataFound />
        <div className="flex justify-center pb-2">
          <Link to="/expenses/add" className="btn-primary text-sm">
            Add expense
          </Link>
        </div>
      </div>
    ) : (
      <ul className="divide-y divide-border">
        {expenses.map((expense) => (
          <li
            key={expense._id}
            className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-surfaceLight/40"
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${getCategoryAvatarClass(
                colorMap[expense.category] || expense.category
              )}`}
            >
              {expense.category?.[0] || "₹"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-textPrimary">
                {expense.title}
              </p>
              <p className="truncate text-xs text-textSecondary">
                {expense.category} · {expense.paymentMode}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold tabular-nums text-primaryDark">
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
);

export const DashboardAccountSnapshot = ({ items = [] }) => (
  <div className="overflow-hidden rounded-lg border border-border bg-white">
    <div className="flex items-center justify-between border-b border-border bg-surfaceLight/60 px-5 py-4">
      <div>
        <h2 className="text-base font-semibold text-textPrimary">
          Accounts this month
        </h2>
        <p className="text-xs text-textSecondary">By payment method</p>
      </div>
      <Link
        to="/reports"
        className="text-sm font-semibold text-accentGreen hover:text-primaryMid"
      >
        Full report
      </Link>
    </div>
    {items.length ? (
      <ul className="divide-y divide-border">
        {items.slice(0, 5).map((row) => (
          <li
            key={row.account}
            className="flex items-center justify-between gap-3 px-5 py-3.5"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-textPrimary">
                {row.account}
              </p>
              <p className="text-xs text-textSecondary">
                In {formatCurrency(row.income)} · Out{" "}
                {formatCurrency(row.expense)}
              </p>
            </div>
            <p
              className={`shrink-0 font-bold tabular-nums ${
                row.net >= 0 ? "text-accentGreen" : "text-red-500"
              }`}
            >
              {formatCurrency(row.net)}
            </p>
          </li>
        ))}
      </ul>
    ) : (
      <p className="px-5 py-8 text-center text-sm text-textSecondary">
        No account activity this month
      </p>
    )}
  </div>
);

