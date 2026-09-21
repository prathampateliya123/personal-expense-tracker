import { formatCurrency } from "../../utils/formatters";
import { IconReports } from "../ui/Icons";

const CATEGORY_TONES = [
  "bg-accentGreen",
  "bg-accentSage",
  "bg-emerald-400",
  "bg-teal-400",
  "bg-sky-400",
  "bg-amber-400",
  "bg-orange-400",
  "bg-slate-400",
];

export const ReportHero = ({ periodLabel, summary, periodType }) => {
  const net = summary?.net || 0;
  const income = summary?.totalIncome || 0;
  const expense = summary?.totalExpense || 0;
  const flow = Math.max(income + expense, 1);
  const incomeShare = Math.round((income / flow) * 100);
  const expenseShare = 100 - incomeShare;

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primaryDark via-primaryMid to-primaryLight text-white">
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accentSage/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-accentGreen/30 blur-3xl"
        aria-hidden
      />

      <div className="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8 lg:p-7">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-accentSage">
              <IconReports className="h-5 w-5" />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accentSage/90">
              {periodType === "yearly" ? "Yearly report" : "Monthly report"}
            </p>
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {periodLabel || "—"}
          </h2>
          <p className="mt-2 max-w-md text-sm text-white/65">
            Income, expenses, category mix and account activity for this period.
          </p>

          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
              Net balance
            </p>
            <p
              className={`mt-1 text-4xl font-bold tabular-nums tracking-tight sm:text-5xl ${
                net >= 0 ? "text-accentSage" : "text-red-300"
              }`}
            >
              {formatCurrency(net)}
            </p>
            <p className="mt-1 text-sm text-white/60">
              Savings rate{" "}
              <span className="font-semibold text-white">
                {summary?.savingsRate ?? 0}%
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-end gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">
                Income
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-accentSage sm:text-2xl">
                {formatCurrency(income)}
              </p>
              <p className="mt-1 text-xs text-white/45">
                {summary?.incomeCount || 0} entries
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">
                Expense
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-red-300 sm:text-2xl">
                {formatCurrency(expense)}
              </p>
              <p className="mt-1 text-xs text-white/45">
                {summary?.expenseCount || 0} entries
              </p>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex justify-between text-[11px] font-medium text-white/55">
              <span>Income {incomeShare}%</span>
              <span>Expense {expenseShare}%</span>
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-accentSage"
                style={{ width: `${incomeShare}%` }}
              />
              <div
                className="h-full bg-red-400/80"
                style={{ width: `${expenseShare}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ReportStatStrip = ({ summary }) => {
  const items = [
    {
      label: "Income",
      value: formatCurrency(summary?.totalIncome || 0),
      meta: `${summary?.incomeCount || 0} in`,
      accent: "text-accentGreen",
    },
    {
      label: "Expense",
      value: formatCurrency(summary?.totalExpense || 0),
      meta: `${summary?.expenseCount || 0} out`,
      accent: "text-red-500",
    },
    {
      label: "Net",
      value: formatCurrency(summary?.net || 0),
      meta: (summary?.net || 0) >= 0 ? "Surplus" : "Deficit",
      accent:
        (summary?.net || 0) >= 0 ? "text-primaryDark" : "text-red-500",
    },
    {
      label: "Savings",
      value: `${summary?.savingsRate ?? 0}%`,
      meta: "Of income kept",
      accent: "text-primaryDark",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 print:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-border bg-white px-4 py-4"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-textSecondary">
            {item.label}
          </p>
          <p className={`mt-1 text-2xl font-bold tabular-nums ${item.accent}`}>
            {item.value}
          </p>
          <p className="mt-0.5 text-xs text-textSecondary">{item.meta}</p>
        </div>
      ))}
    </div>
  );
};

export const IncomeExpenseChart = ({ series = [], periodType = "monthly" }) => {
  const max = Math.max(
    1,
    ...series.map((row) => Math.max(row.income || 0, row.expense || 0))
  );
  const dense = periodType === "monthly" && series.length > 20;
  const peak = series.reduce(
    (best, row) =>
      (row.income || 0) + (row.expense || 0) >
      (best.income || 0) + (best.expense || 0)
        ? row
        : best,
    series[0] || { label: "—", income: 0, expense: 0 }
  );

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="flex flex-col gap-3 border-b border-border bg-surfaceLight/60 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-textPrimary">
            Income vs expense
          </h2>
          <p className="text-xs text-textSecondary">
            {periodType === "yearly"
              ? "Month-by-month cash flow"
              : "Day-by-day cash flow"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 text-textSecondary">
            <span className="h-2.5 w-2.5 rounded-sm bg-accentGreen" /> Income
          </span>
          <span className="inline-flex items-center gap-1.5 text-textSecondary">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-400" /> Expense
          </span>
          {peak ? (
            <span className="rounded-lg bg-white px-2.5 py-1 text-textSecondary ring-1 ring-border">
              Peak {peak.label}: {formatCurrency((peak.income || 0) + (peak.expense || 0))}
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {!series.length ? (
          <p className="py-10 text-center text-sm text-textSecondary">
            No data for this period
          </p>
        ) : (
          <div
            className={`flex items-end gap-1 overflow-x-auto pb-1 ${
              dense ? "min-h-[220px]" : "min-h-[240px] gap-1.5"
            }`}
          >
            {series.map((row) => {
              const incomeH = Math.round(((row.income || 0) / max) * 170);
              const expenseH = Math.round(((row.expense || 0) / max) * 170);
              const showLabel =
                !dense ||
                Number(row.label) % 5 === 1 ||
                Number(row.label) === series.length ||
                periodType === "yearly";

              return (
                <div
                  key={row.key}
                  className="group flex min-w-[1.5rem] flex-1 flex-col items-center gap-1.5"
                  title={`${row.label}\nIncome ${formatCurrency(row.income)}\nExpense ${formatCurrency(row.expense)}`}
                >
                  <div className="flex h-[170px] w-full items-end justify-center gap-0.5">
                    <div
                      className="w-[42%] rounded-t-md bg-gradient-to-t from-accentGreen to-accentSage transition group-hover:opacity-90"
                      style={{
                        height: `${Math.max(incomeH, row.income ? 4 : 0)}px`,
                      }}
                    />
                    <div
                      className="w-[42%] rounded-t-md bg-gradient-to-t from-red-500 to-red-300 transition group-hover:opacity-90"
                      style={{
                        height: `${Math.max(expenseH, row.expense ? 4 : 0)}px`,
                      }}
                    />
                  </div>
                  <span className="h-4 text-[10px] font-medium text-textSecondary">
                    {showLabel ? row.label : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const CategoryReport = ({
  title,
  subtitle,
  items = [],
  emptyLabel,
  variant = "expense",
}) => {
  const max = Math.max(1, ...items.map((row) => row.total || 0));
  const barClass =
    variant === "income"
      ? "bg-gradient-to-r from-accentGreen to-accentSage"
      : "bg-gradient-to-r from-primaryMid to-accentGreen";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white">
      <div className="border-b border-border bg-surfaceLight/60 px-5 py-4">
        <h2 className="text-base font-semibold text-textPrimary">{title}</h2>
        <p className="text-xs text-textSecondary">{subtitle}</p>
      </div>
      <div className="flex-1 space-y-3.5 p-5">
        {items.length ? (
          items.slice(0, 8).map((row, index) => (
            <div key={row.category} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surfaceGray text-xs font-bold text-textSecondary">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-textPrimary">
                      {row.category}
                    </p>
                    <p className="text-[11px] text-textSecondary">
                      {row.count} entries · {row.percent}%
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold tabular-nums text-primaryDark">
                    {formatCurrency(row.total)}
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surfaceGray">
                  <div
                    className={`h-full rounded-full ${barClass}`}
                    style={{
                      width: `${Math.max(
                        8,
                        Math.round((row.total / max) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <span
                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                  CATEGORY_TONES[index % CATEGORY_TONES.length]
                }`}
              />
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-sm text-textSecondary">
            {emptyLabel}
          </p>
        )}
      </div>
    </div>
  );
};

export const AccountReport = ({ items = [] }) => {
  const maxFlow = Math.max(
    1,
    ...items.map((row) => (row.income || 0) + (row.expense || 0))
  );

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="border-b border-border bg-surfaceLight/60 px-5 py-4">
        <h2 className="text-base font-semibold text-textPrimary">
          Account-wise report
        </h2>
        <p className="text-xs text-textSecondary">
          Payment methods and how money moved through each
        </p>
      </div>

      {items.length ? (
        <ul className="divide-y divide-border">
          {items.map((row, index) => {
            const flow = (row.income || 0) + (row.expense || 0);
            const incomePct =
              flow > 0 ? Math.round(((row.income || 0) / flow) * 100) : 0;
            return (
              <li
                key={row.account}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-5"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-successBg text-sm font-bold text-primaryDark">
                    {String(row.account || "?")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-textPrimary">
                      {row.account}
                    </p>
                    <p className="text-xs text-textSecondary">
                      #{index + 1} by activity · {row.incomeCount} in ·{" "}
                      {row.expenseCount} out
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-44">
                  <div className="mb-1 flex justify-between text-[10px] font-medium text-textSecondary">
                    <span>{incomePct}% in</span>
                    <span>{100 - incomePct}% out</span>
                  </div>
                  <div className="flex h-1.5 overflow-hidden rounded-full bg-surfaceGray">
                    <div
                      className="h-full bg-accentGreen"
                      style={{ width: `${incomePct}%` }}
                    />
                    <div
                      className="h-full bg-red-400"
                      style={{ width: `${100 - incomePct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-textSecondary">
                    Flow {formatCurrency(flow)} ·{" "}
                    {Math.round((flow / maxFlow) * 100)}% of max
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:w-56">
                  <div>
                    <p className="text-[10px] uppercase text-textSecondary">
                      In
                    </p>
                    <p className="text-sm font-bold tabular-nums text-accentGreen">
                      {formatCurrency(row.income)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-textSecondary">
                      Out
                    </p>
                    <p className="text-sm font-bold tabular-nums text-red-500">
                      {formatCurrency(row.expense)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-textSecondary">
                      Net
                    </p>
                    <p
                      className={`text-sm font-bold tabular-nums ${
                        row.net >= 0 ? "text-primaryDark" : "text-red-500"
                      }`}
                    >
                      {formatCurrency(row.net)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-5 py-10 text-center text-sm text-textSecondary">
          No account activity in this period
        </p>
      )}
    </div>
  );
};
