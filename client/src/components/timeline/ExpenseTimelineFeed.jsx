import { Link } from "react-router-dom";
import { formatCurrency, formatExpenseTime } from "../../utils/formatters";
import { getCategoryAvatarClass } from "../../utils/categoryColors";
import { toDateOnly } from "../../utils/dateRange";
import NoDataFound from "../ui/NoDataFound";
import { PencilSquareIcon } from "../ui/Icons";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const formatTimelineDayLabel = (isoDate) => {
  const date = toDateOnly(isoDate);
  if (!date) return isoDate;
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
};

export const formatTimelineDayMeta = (isoDate) => {
  const date = toDateOnly(isoDate);
  if (!date) return "";
  return `${WEEKDAYS_LONG[date.getDay()]} · ${date.getFullYear()}`;
};

const ExpenseTimelineFeed = ({
  days = [],
  loading = false,
  colorMap = {},
  selectedDateKey = null,
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-8 w-40 animate-pulse rounded-lg bg-surfaceGray" />
            <div className="h-20 animate-pulse rounded-lg bg-surfaceLight" />
            <div className="h-20 animate-pulse rounded-lg bg-surfaceLight" />
          </div>
        ))}
      </div>
    );
  }

  const visibleDays = selectedDateKey
    ? days.filter((d) => d.date === selectedDateKey)
    : days;

  if (!visibleDays.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surfaceLight/40 px-4 py-8">
        <NoDataFound />
        <div className="flex justify-center pb-6">
          <Link to="/expenses/add" className="btn-primary text-sm">
            Add expense
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="absolute bottom-4 left-[1.15rem] top-4 w-px bg-gradient-to-b from-accentGreen via-border to-transparent sm:left-[1.35rem]"
        aria-hidden
      />

      <ol className="space-y-8">
        {visibleDays.map((day, dayIndex) => (
          <li
            key={day.date}
            id={`timeline-day-${day.date}`}
            className="relative scroll-mt-24 animate-timelineIn"
            style={{ animationDelay: `${Math.min(dayIndex, 6) * 60}ms` }}
          >
            <div className="mb-4 flex items-end gap-3 sm:gap-4">
              <div className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primaryDark text-sm font-bold text-white sm:h-11 sm:w-11">
                {toDateOnly(day.date)?.getDate()}
              </div>
              <div className="min-w-0 flex-1 pb-0.5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
                    {formatTimelineDayLabel(day.date)}
                  </h3>
                  <span className="text-xs font-medium text-textSecondary">
                    {formatTimelineDayMeta(day.date)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-textSecondary">
                  {day.count} item{day.count === 1 ? "" : "s"} · day total{" "}
                  <span className="font-semibold text-accentGreen">
                    {formatCurrency(day.total)}
                  </span>
                </p>
              </div>
            </div>

            <ul className="ml-2 space-y-2 border-l-2 border-transparent pl-8 sm:ml-3 sm:pl-10">
              {day.expenses.map((expense) => (
                <li key={expense._id}>
                  <div className="group flex items-center gap-3 rounded-lg border border-border/80 bg-white px-3 py-3 transition hover:border-accentGreen/35 hover:bg-successBg/40 sm:gap-4 sm:px-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${getCategoryAvatarClass(
                        colorMap[expense.category] || expense.category
                      )}`}
                    >
                      {expense.category?.[0] || "₹"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <p className="text-base font-bold tabular-nums text-primaryDark">
                          {formatCurrency(expense.amount)}
                        </p>
                        <p className="truncate text-sm font-medium text-textPrimary">
                          {expense.category}
                        </p>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-textSecondary">
                        {expense.title}
                        {expense.paymentMode
                          ? ` · ${expense.paymentMode}`
                          : ""}
                        {" · "}
                        {formatExpenseTime(
                          expense.createdAt || expense.date
                        )}
                      </p>
                    </div>
                    <Link
                      to={`/expenses/${expense._id}/edit`}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-textSecondary opacity-70 transition hover:border-border hover:bg-white hover:text-primaryDark group-hover:opacity-100"
                      title="Edit expense"
                      aria-label={`Edit ${expense.title}`}
                    >
                      <PencilSquareIcon />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default ExpenseTimelineFeed;
