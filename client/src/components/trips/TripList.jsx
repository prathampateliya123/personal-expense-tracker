import { Link } from "react-router-dom";
import {
  PencilSquareIcon,
  TrashIcon,
  IconChevronRight,
} from "../ui/Icons";
import NoDataFound from "../ui/NoDataFound";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  getTripStatusLabel,
  tripStatusBadgeClass,
} from "../../utils/tripConstants";

const TripList = ({
  items = [],
  loading = false,
  onDelete,
  deleting = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-surfaceGray" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="card">
        <NoDataFound />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((trip) => (
        <div
          key={trip._id}
          className="card flex flex-col overflow-hidden transition hover:border-accentGreen/40"
        >
          <div className="border-b border-border bg-gradient-to-br from-primaryDark via-primaryMid to-primaryLight p-5 text-white">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-lg font-bold">{trip.title}</p>
                <p className="mt-0.5 truncate text-sm text-white/70">
                  {trip.destination || "No destination"} ·{" "}
                  {trip.memberCount || trip.members?.length || 0} members
                </p>
              </div>
              <span
                className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold ${tripStatusBadgeClass(
                  trip.status
                )}`}
              >
                {getTripStatusLabel(trip.status)}
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold tabular-nums">
              {formatCurrency(trip.totalSpend || 0)}
            </p>
            <p className="text-xs text-white/65">
              {trip.expenseCount || 0} expense
              {(trip.expenseCount || 0) === 1 ? "" : "s"}
              {trip.startDate ? ` · ${formatDate(trip.startDate)}` : ""}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 p-3">
            <Link
              to={`/trips/${trip._id}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-accentGreen hover:text-primaryMid"
            >
              Open trip
              <IconChevronRight className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-1.5">
              <Link
                to={`/trips/${trip._id}/edit`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-textSecondary transition hover:border-accentGreen/30 hover:bg-successBg hover:text-primaryDark"
                title="Edit"
              >
                <PencilSquareIcon />
              </Link>
              <button
                type="button"
                disabled={deleting}
                onClick={() => onDelete(trip)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-textSecondary transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                title="Delete"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TripList;
