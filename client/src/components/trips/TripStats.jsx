import { StatCard } from "../common/StatCard";
import { formatCurrency } from "../../utils/formatters";

const TripStats = ({ stats }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard
      label="Trips"
      value={stats?.totalTrips ?? 0}
      hint="All saved trips"
      hero
    />
    <StatCard
      label="Active"
      value={stats?.activeTrips ?? 0}
      hint="Currently open"
    />
    <StatCard
      label="Open balances"
      value={stats?.unsettledTrips ?? 0}
      hint="Not fully settled"
    />
    <StatCard
      label="Total spend"
      value={formatCurrency(stats?.totalSpend ?? 0)}
      hint="Across all trips"
    />
  </div>
);

export default TripStats;
