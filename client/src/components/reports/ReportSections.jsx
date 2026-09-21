import { formatCurrency } from "../../utils/formatters";

export const ReportStatCards = ({ summary }) => {
  const cards = [
    {
      label: "Total income",
      value: formatCurrency(summary?.totalIncome || 0),
      hint: `${summary?.incomeCount || 0} entries`,
      tone: "hero",
    },
    {
      label: "Total expense",
      value: formatCurrency(summary?.totalExpense || 0),
      hint: `${summary?.expenseCount || 0} entries`,
      tone: "danger",
    },
    {
      label: "Net balance",
      value: formatCurrency(summary?.net || 0),
      hint:
        (summary?.net || 0) >= 0 ? "Income exceeded spend" : "Spent more than earned",
      tone: (summary?.net || 0) >= 0 ? "ok" : "danger",
    },
    {
      label: "Savings rate",
      value: `${summary?.savingsRate ?? 0}%`,
      hint: "Net ÷ income",
      tone: "ok",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 print:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-lg border p-5 ${
            card.tone === "hero"
              ? "border-transparent bg-gradient-to-br from-primaryDark via-primaryMid to-primaryLight text-white"
              : "border-border bg-white"
          }`}
        >
          <p
            className={`text-xs font-medium uppercase tracking-wide ${
              card.tone === "hero" ? "text-white/75" : "text-textSecondary"
            }`}
          >
            {card.label}
          </p>
          <p
            className={`mt-1 text-2xl font-bold tabular-nums ${
              card.tone === "hero"
                ? "text-white"
                : card.tone === "danger"
                  ? "text-red-500"
                  : "text-primaryDark"
            }`}
          >
            {card.value}
          </p>
          <p
            className={`mt-1 text-xs ${
              card.tone === "hero" ? "text-white/65" : "text-textSecondary"
            }`}
          >
            {card.hint}
          </p>
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

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-border bg-surfaceLight/50 px-5 py-4">
        <h2 className="text-base font-semibold text-textPrimary">
          Income vs expense
        </h2>
        <p className="text-xs text-textSecondary">
          {periodType === "yearly"
            ? "Month-by-month comparison"
            : "Day-by-day comparison"}
        </p>
      </div>
      <div className="p-5">
        {!series.length ? (
          <p className="text-sm text-textSecondary">No data for this period</p>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-4 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 text-textSecondary">
                <span className="h-2.5 w-2.5 rounded-sm bg-accentGreen" /> Income
              </span>
              <span className="inline-flex items-center gap-1.5 text-textSecondary">
                <span className="h-2.5 w-2.5 rounded-sm bg-red-400" /> Expense
              </span>
            </div>
            <div
              className={`flex items-end gap-1 overflow-x-auto pb-2 ${
                dense ? "min-h-[180px]" : "min-h-[200px] gap-1.5"
              }`}
            >
              {series.map((row) => {
                const incomeH = Math.round(((row.income || 0) / max) * 140);
                const expenseH = Math.round(((row.expense || 0) / max) * 140);
                return (
                  <div
                    key={row.key}
                    className="flex min-w-[1.35rem] flex-1 flex-col items-center gap-1"
                    title={`${row.label}: In ${row.income} / Out ${row.expense}`}
                  >
                    <div className="flex h-[140px] w-full items-end justify-center gap-0.5">
                      <div
                        className="w-[45%] rounded-t-sm bg-accentGreen/90"
                        style={{ height: `${Math.max(incomeH, row.income ? 3 : 0)}px` }}
                      />
                      <div
                        className="w-[45%] rounded-t-sm bg-red-400/90"
                        style={{
                          height: `${Math.max(expenseH, row.expense ? 3 : 0)}px`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-[10px] text-textSecondary ${
                        dense ? "rotate-0" : ""
                      }`}
                    >
                      {dense && Number(row.label) % 5 !== 1 && Number(row.label) !== series.length
                        ? ""
                        : row.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const CategoryReport = ({ title, items = [], emptyLabel }) => {
  const max = Math.max(1, ...items.map((row) => row.total || 0));

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-border bg-surfaceLight/50 px-5 py-4">
        <h2 className="text-base font-semibold text-textPrimary">{title}</h2>
        <p className="text-xs text-textSecondary">Category-wise breakdown</p>
      </div>
      <div className="space-y-3 p-5">
        {items.length ? (
          items.map((row) => (
            <div key={row.category}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-textPrimary">
                  {row.category}
                  <span className="ml-2 text-xs font-normal text-textSecondary">
                    {row.count} · {row.percent}%
                  </span>
                </span>
                <span className="font-bold tabular-nums text-primaryDark">
                  {formatCurrency(row.total)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surfaceGray">
                <div
                  className="h-full rounded-full bg-accentGreen"
                  style={{
                    width: `${Math.max(6, Math.round((row.total / max) * 100))}%`,
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-textSecondary">{emptyLabel}</p>
        )}
      </div>
    </div>
  );
};

export const AccountReport = ({ items = [] }) => (
  <div className="card overflow-hidden">
    <div className="border-b border-border bg-surfaceLight/50 px-5 py-4">
      <h2 className="text-base font-semibold text-textPrimary">
        Account-wise report
      </h2>
      <p className="text-xs text-textSecondary">
        By payment method / account
      </p>
    </div>
    {items.length ? (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-surfaceLight/80 text-xs uppercase tracking-wide text-textSecondary">
            <tr>
              <th className="px-5 py-3">Account</th>
              <th className="px-4 py-3">Income</th>
              <th className="px-4 py-3">Expense</th>
              <th className="px-4 py-3">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((row) => (
              <tr key={row.account} className="hover:bg-surfaceLight/40">
                <td className="px-5 py-3 font-medium text-textPrimary">
                  {row.account}
                  <p className="text-xs font-normal text-textSecondary">
                    {row.incomeCount} in · {row.expenseCount} out
                  </p>
                </td>
                <td className="px-4 py-3 tabular-nums text-accentGreen">
                  {formatCurrency(row.income)}
                </td>
                <td className="px-4 py-3 tabular-nums text-red-500">
                  {formatCurrency(row.expense)}
                </td>
                <td
                  className={`px-4 py-3 font-bold tabular-nums ${
                    row.net >= 0 ? "text-primaryDark" : "text-red-500"
                  }`}
                >
                  {formatCurrency(row.net)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="p-5 text-sm text-textSecondary">
        No account activity in this period
      </p>
    )}
  </div>
);
