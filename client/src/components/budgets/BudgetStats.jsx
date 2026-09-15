import CircularProgress from "../common/CircularProgress";
import StatCard from "../common/StatCard";
import { formatCurrency } from "../../utils/formatters";

const BudgetStats = ({
  loading,
  progress,
  totalAmount,
  allocatedTotal,
  budget,
  periodLabel,
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-surfaceGray" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Monthly budget"
          value={formatCurrency(progress?.totalAmount || Number(totalAmount) || 0)}
          hint={budget ? "Saved plan" : "Not saved yet"}
        />
        <StatCard
          label="Spent"
          value={formatCurrency(progress?.totalSpent || 0)}
          hint={`${progress?.expenseCount || 0} expense${
            (progress?.expenseCount || 0) === 1 ? "" : "s"
          }`}
          danger={Boolean(progress?.overBudget)}
        />
        <StatCard
          label="Remaining"
          value={formatCurrency(progress?.remaining || 0)}
          hint={
            progress?.overBudget ? "Over budget" : "Left for this month"
          }
          danger={Boolean(progress?.overBudget)}
        />
        <StatCard
          label="Allocated"
          value={formatCurrency(allocatedTotal)}
          hint={
            Number(totalAmount) > 0
              ? `${formatCurrency(
                  Math.max(0, Number(totalAmount) - allocatedTotal)
                )} unallocated`
              : "Set total budget first"
          }
        />
      </div>

      <div className="card flex flex-col items-center justify-center gap-3 p-6">
        <CircularProgress
          percent={progress?.percentUsed || 0}
          label={progress?.overBudget ? "Over budget" : "of budget"}
        />
        {!budget ? (
          <p className="text-center text-sm text-textSecondary">
            No budget saved for {periodLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default BudgetStats;
