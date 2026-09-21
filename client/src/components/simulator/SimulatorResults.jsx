import { formatCurrency } from "../../utils/formatters";
import { isEmiBillType } from "../../utils/billSimulator";

const ResultCard = ({ label, value, hint }) => (
  <div className="rounded-lg border border-border bg-surfaceLight/60 p-4">
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
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <ResultCard
            label="Monthly EMI"
            value={formatCurrency(result.monthlyEmi)}
            hint="Fixed installment"
          />
          <ResultCard
            label="Total interest"
            value={formatCurrency(result.totalInterest)}
            hint="Over full tenure"
          />
          <ResultCard
            label="Total payment"
            value={formatCurrency(result.totalPayment)}
            hint="Principal + interest"
          />
        </div>

        {result.schedule?.length ? (
          <div className="card overflow-hidden">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-textPrimary">
                Amortization preview
              </h3>
              <p className="text-xs text-textSecondary">
                First {Math.min(12, result.schedule.length)} of{" "}
                {result.schedule.length} months
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
