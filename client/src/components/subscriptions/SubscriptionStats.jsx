import StatCard from "../common/StatCard";
import { formatCurrency } from "../../utils/formatters";

const SubscriptionStats = ({ stats }) => (
  <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard
      label="Monthly cost"
      value={formatCurrency(stats?.monthlyCost)}
      hint={`${stats?.active || 0} active subscriptions`}
      hero
    />
    <StatCard
      label="Yearly cost"
      value={formatCurrency(stats?.yearlyCost)}
      hint="Projected from active plans"
    />
    <StatCard
      label="Due in 7 days"
      value={stats?.dueSoon ?? 0}
      hint="Upcoming or overdue bills"
    />
    <StatCard
      label="Auto-expense on"
      value={stats?.autoEnabled ?? 0}
      hint={`${stats?.paused || 0} paused`}
    />
  </div>
);

export default SubscriptionStats;
