import { Link } from "react-router-dom";
import {
  PencilSquareIcon,
  TrashIcon,
  IconChevronRight,
  IconTrip,
} from "../ui/Icons";
import NoDataFound from "../ui/NoDataFound";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  getTripStatusLabel,
  tripStatusBadgeClass,
  TRIP_EXPENSE_CATEGORIES,
} from "../../utils/tripConstants";

const CATEGORY_ACCENT = {
  Food: "bg-amber-400",
  Hotel: "bg-sky-400",
  Transport: "bg-emerald-400",
  Other: "bg-slate-400",
};

const memberInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const TripCard = ({ trip, onDelete, deleting }) => {
  const members = trip.members || [];
  const memberCount = trip.memberCount || members.length || 0;
  const breakdownMap = Object.fromEntries(
    (trip.breakdown || []).map((row) => [row.category, row.total])
  );
  const hasSpend = (trip.totalSpend || 0) > 0;
  const maxCat = Math.max(
    1,
    ...TRIP_EXPENSE_CATEGORIES.map((c) => Number(breakdownMap[c.value]) || 0)
  );

  const dateLabel = trip.startDate
    ? formatDate(trip.startDate)
    : trip.createdAt
      ? formatDate(trip.createdAt)
      : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-white transition hover:border-accentGreen/50">
      <div className="relative overflow-hidden bg-gradient-to-br from-primaryDark via-primaryMid to-primaryLight p-5 text-white sm:p-6">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-accentSage/20 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-14 left-8 h-28 w-28 rounded-full bg-accentGreen/25 blur-2xl"
          aria-hidden
        />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-accentSage">
              <IconTrip className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold tracking-tight capitalize sm:text-xl">
                {trip.title}
              </h3>
              <p className="mt-0.5 truncate text-sm text-white/65">
                {trip.destination || "No destination"} · {memberCount} member
                {memberCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <span
            className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${tripStatusBadgeClass(
              trip.status
            )}`}
          >
            {getTripStatusLabel(trip.status)}
          </span>
        </div>

        <div className="relative mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
            Trip total
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
            {formatCurrency(trip.totalSpend || 0)}
          </p>
          <p className="mt-1 text-xs text-white/60">
            {trip.expenseCount || 0} expense
            {(trip.expenseCount || 0) === 1 ? "" : "s"}
            {dateLabel ? ` · ${dateLabel}` : ""}
            {trip.settlementCount
              ? ` · ${trip.settlementCount} settlement${
                  trip.settlementCount === 1 ? "" : "s"
                }`
              : ""}
          </p>
        </div>

        <div className="relative mt-5 flex items-center">
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((member) => (
              <div
                key={member._id || member.name}
                title={member.name}
                className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-primaryMid bg-accentSage/90 text-[10px] font-bold text-primaryDark"
              >
                {memberInitials(member.name)}
              </div>
            ))}
            {memberCount > 4 ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-primaryMid bg-white/15 text-[10px] font-bold text-white">
                +{memberCount - 4}
              </div>
            ) : null}
          </div>
          <p className="ml-3 truncate text-xs text-white/55">
            {members
              .slice(0, 3)
              .map((m) => m.name)
              .join(", ")}
            {memberCount > 3 ? ` +${memberCount - 3}` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">
              Categories
            </p>
            {!hasSpend ? (
              <p className="text-[11px] text-textSecondary">No spend yet</p>
            ) : null}
          </div>
          <div className="space-y-2">
            {TRIP_EXPENSE_CATEGORIES.map((cat) => {
              const amount = Number(breakdownMap[cat.value]) || 0;
              const pct = hasSpend ? Math.round((amount / maxCat) * 100) : 0;
              return (
                <div key={cat.value} className="flex items-center gap-2.5">
                  <span className="w-16 shrink-0 text-xs font-medium text-textSecondary">
                    {cat.label}
                  </span>
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surfaceGray">
                    <div
                      className={`h-full rounded-full transition-all ${
                        CATEGORY_ACCENT[cat.value] || "bg-accentGreen"
                      } ${amount ? "" : "opacity-30"}`}
                      style={{ width: amount ? `${Math.max(pct, 8)}%` : "0%" }}
                    />
                  </div>
                  <span className="w-[4.5rem] shrink-0 text-right text-xs font-semibold tabular-nums text-textPrimary">
                    {formatCurrency(amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-4">
          <Link
            to={`/trips/${trip._id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-successBg px-3 py-2 text-sm font-semibold text-primaryDark transition hover:bg-accentSage/40"
          >
            Open trip
            <IconChevronRight className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-1.5">
            <Link
              to={`/trips/${trip._id}/edit`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-accentGreen/30 hover:bg-successBg hover:text-primaryDark"
              title="Edit trip"
              aria-label={`Edit ${trip.title}`}
            >
              <PencilSquareIcon />
            </Link>
            <button
              type="button"
              disabled={deleting}
              onClick={() => onDelete(trip)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
              title="Delete trip"
              aria-label={`Delete ${trip.title}`}
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

const TripList = ({
  items = [],
  loading = false,
  onDelete,
  deleting = false,
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[360px] animate-pulse rounded-lg bg-surfaceGray"
          />
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
        <TripCard
          key={trip._id}
          trip={trip}
          onDelete={onDelete}
          deleting={deleting}
        />
      ))}
    </div>
  );
};

export default TripList;
