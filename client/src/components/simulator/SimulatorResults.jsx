import { formatCurrency } from "../../utils/formatters";
import { isEmiBillType } from "../../utils/billSimulator";

const ResultCard = ({ label, value, hint, accent = false }) => (
  <div
    className={`rounded-lg border p-4 ${
      accent
        ? "border-accentGreen/40 bg-successBg/70"
        : "border-border bg-surfaceLight/60"
    }`}
  >
    <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">
      {label}
    </p>
    <p className="mt-1 text-2xl font-bold text-primaryDark">{value}</p>
    {hint ? <p className="mt-1 text-xs text-textSecondary">{hint}</p> : null}
  </div>
);

const SimulatorResults = ({ billType, result }) => {
  if (!result || result.error) {
    return (
      <div className="card flex min-h-[180px] items-center justify-center p-6 text-sm text-textSecondary">
        {result?.error || "Enter values to see EMI / bill projection"}
      </div>
    );
  }

  if (isEmiBillType(billType)) {
    const paid = result.paidEmis || 0;
    const total = result.tenureMonths || 0;
    const progress = total > 0 ? Math.round((paid / total) * 100) : 0;

    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <ResultCard
            label="Monthly EMI"
            value={formatCurrency(result.monthlyEmi)}
            hint="Fixed installment"
            accent
          />
          <ResultCard
            label="Outstanding principal"
            value={formatCurrency(result.outstandingPrincipal)}
            hint={
              paid > 0
                ? `After ${paid} EMI${paid === 1 ? "" : "s"} paid`
                : "Full loan amount"
            }
          />
          <ResultCard
            label="Remaining EMIs"
            value={result.remainingEmis ?? 0}
            hint={`${paid} paid · ${total} total`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard
            label="Remaining interest"
            value={formatCurrency(result.remainingInterest)}
            hint="Still to pay on remaining tenure"
          />
          <ResultCard
            label="Remaining payment"
            value={formatCurrency(result.remainingPayment)}
            hint="Principal left + interest left"
          />
        </div>

        {paid > 0 ? (
          <div className="card space-y-3 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-textPrimary">
                  Progress so far
                </h3>
                <p className="text-xs text-textSecondary">
                  Already paid {formatCurrency(result.paidAmount)} (
                  {formatCurrency(result.paidPrincipal)} principal +{" "}
                  {formatCurrency(result.paidInterest)} interest)
                </p>
              </div>
              <p className="text-sm font-bold text-accentGreen">{progress}%</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surfaceGray">
              <div
                className="h-full rounded-full bg-accentGreen transition-all"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard
            label="Original total interest"
            value={formatCurrency(result.totalInterest)}
            hint="If loan ran full tenure from start"
          />
          <ResultCard
            label="Original total payment"
            value={formatCurrency(result.totalPayment)}
            hint="Principal + interest over full tenure"
          />
        </div>

        {result.schedule?.length ? (
          <div className="card overflow-hidden">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-textPrimary">
                Upcoming EMI schedule
              </h3>
              <p className="text-xs text-textSecondary">
                Next {Math.min(12, result.schedule.length)} of{" "}
                {result.remainingEmis} remaining months
                {paid > 0 ? ` (starts from month ${paid + 1})` : ""}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-surfaceLight/80 text-xs uppercase tracking-wide text-textSecondary">
                  <tr>
                    <th className="px-4 py-2.5">Month</th>
                    <th className="px-4 py-2.5">EMI</th>
                    <th className="px-4 py-2.5">Principal</th>
                    <th className="px-4 py-2.5">Interest</th>
                    <th className="px-4 py-2.5">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.schedule.slice(0, 12).map((row) => (
                    <tr key={row.month}>
                      <td className="px-4 py-2.5">{row.month}</td>
                      <td className="px-4 py-2.5 tabular-nums">
                        {formatCurrency(row.emi)}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums">
                        {formatCurrency(row.principal)}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums">
                        {formatCurrency(row.interest)}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums">
                        {formatCurrency(row.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ResultCard
        label="Monthly equivalent"
        value={formatCurrency(result.monthlyEquivalent)}
        hint="Normalized monthly outflow"
      />
      <ResultCard
        label="Yearly cost"
        value={formatCurrency(result.yearlyCost)}
        hint="Projected for 12 months"
      />
    </div>
  );
};

export default SimulatorResults;
