import StatCard from "../common/StatCard";
import { formatCurrency } from "../../utils/formatters";

const SimulatorStats = ({ stats }) => (
  <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard
      label="Saved scenarios"
      value={stats?.total ?? 0}
      hint={`${stats?.emiCount || 0} EMI · ${stats?.billCount || 0} bills`}
      hero
    />
    <StatCard
      label="Monthly load"
      value={formatCurrency(stats?.monthlyLoad)}
      hint="From saved simulations"
    />
    <StatCard
      label="Yearly load"
      value={formatCurrency(stats?.yearlyLoad)}
      hint="Projected annual outflow"
    />
    <StatCard
      label="EMI scenarios"
      value={stats?.emiCount ?? 0}
      hint="Loan & credit-card EMI"
    />
  </div>
);

export default SimulatorStats;
