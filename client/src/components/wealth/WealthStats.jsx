import CircularProgress from "../common/CircularProgress";
import StatCard from "../common/StatCard";
import { formatCurrency } from "../../utils/formatters";
import { getInvestmentTypeLabel } from "../../utils/wealthConstants";

const WealthStats = ({ variant = "savings", stats }) => {
  if (variant === "investments") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Invested"
          value={formatCurrency(stats?.totalInvested)}
          hint={`${stats?.count || 0} holdings`}
        />
        <StatCard
          label="Current value"
          value={formatCurrency(stats?.totalCurrent)}
        />
        <StatCard
          label="Gain / Loss"
          value={formatCurrency(stats?.gainLoss)}
          hint={`${stats?.returnPercent || 0}% return`}
          danger={(stats?.gainLoss || 0) < 0}
        />
        <StatCard
          label="Top type"
          value={
            stats?.byType?.[0]
              ? getInvestmentTypeLabel(stats.byType[0].type)
              : "—"
          }
          hint={
            stats?.byType?.[0]
              ? formatCurrency(stats.byType[0].totalCurrent)
              : "No investments yet"
          }
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total saved"
        value={formatCurrency(stats?.totalSaved)}
        hint={`${stats?.totalGoals || 0} goals`}
      />
      <StatCard
        label="Total targets"
        value={formatCurrency(stats?.totalTarget)}
        hint={`${stats?.active || 0} active`}
      />
      <StatCard
        label="Remaining"
        value={formatCurrency(stats?.remaining)}
        hint={`${stats?.completed || 0} completed`}
      />
      <div className="card flex items-center justify-center p-4">
        <CircularProgress
          percent={stats?.percentComplete || 0}
          label="overall"
          size={120}
        />
      </div>
    </div>
  );
};

export default WealthStats;
