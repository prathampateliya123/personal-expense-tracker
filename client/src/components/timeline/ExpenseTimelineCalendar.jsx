import {
  addMonths,
  formatIsoDate,
  getMonthMatrix,
  isSameDay,
  startOfMonth,
  toDateOnly,
} from "../../utils/dateRange";
import { formatCurrency } from "../../utils/formatters";
import {
  IconChevronLeft,
  IconChevronRight,
} from "../ui/Icons";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const heatClass = (amount, maxAmount) => {
  if (!amount || !maxAmount) return "bg-white/5 text-white/55";
  const ratio = amount / maxAmount;
  if (ratio >= 0.75) return "bg-accentSage text-primaryDark";
  if (ratio >= 0.45) return "bg-accentSage/70 text-primaryDark";
  if (ratio >= 0.2) return "bg-accentSage/40 text-white";
  return "bg-white/10 text-white/80";
};

const ExpenseTimelineCalendar = ({
  monthDate,
  onMonthChange,
  selectedDate,
  onSelectDate,
  dayTotals = {},
  monthTotal = 0,
  monthCount = 0,
}) => {
  const monthStart = startOfMonth(monthDate);
  const matrix = getMonthMatrix(monthStart);
  const today = toDateOnly(new Date());
  const maxDay = Math.max(0, ...Object.values(dayTotals).map(Number));
  const viewingMonth = monthStart.getMonth();
  const viewingYear = monthStart.getFullYear();

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primaryDark via-primaryMid to-primaryLight text-white shadow-none">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accentSage/20 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-accentGreen/30 blur-2xl"
        aria-hidden
      />

      <div className="relative space-y-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accentSage/90">
              Calendar
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              {MONTH_LABELS[viewingMonth]} {viewingYear}
            </h2>
            <p className="mt-1 text-sm text-white/65">
              {monthCount} expense{monthCount === 1 ? "" : "s"} ·{" "}
              {formatCurrency(monthTotal)}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onMonthChange(addMonths(monthStart, -1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white transition hover:bg-white/15"
              aria-label="Previous month"
            >
              <IconChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onMonthChange(addMonths(monthStart, 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white transition hover:bg-white/15"
              aria-label="Next month"
            >
              <IconChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-white/45">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {matrix.flat().map((day) => {
            const key = formatIsoDate(day);
            const inMonth = day.getMonth() === viewingMonth;
            const amount = Number(dayTotals[key]) || 0;
            const selected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, today);

            return (
              <button
                key={key}
                type="button"
                disabled={!inMonth}
                onClick={() => inMonth && onSelectDate(day)}
                className={`relative flex min-h-[3.25rem] flex-col items-center justify-center rounded-lg border px-1 py-1.5 transition ${
                  !inMonth
                    ? "cursor-default border-transparent text-white/15"
                    : selected
                      ? "border-accentSage bg-accentSage text-primaryDark shadow-[inset_0_0_0_1px_rgba(5,31,32,0.15)]"
                      : `${heatClass(amount, maxDay)} border-white/10 hover:border-accentSage/50`
                }`}
              >
                <span
                  className={`text-sm font-bold tabular-nums ${
                    isToday && !selected ? "text-accentSage" : ""
                  }`}
                >
                  {day.getDate()}
                </span>
                {inMonth && amount > 0 ? (
                  <span
                    className={`mt-0.5 max-w-full truncate text-[9px] font-semibold tabular-nums leading-none ${
                      selected ? "text-primaryDark/80" : "opacity-90"
                    }`}
                  >
                    {amount >= 1000
                      ? `${Math.round(amount / 1000)}k`
                      : Math.round(amount)}
                  </span>
                ) : null}
                {isToday && inMonth ? (
                  <span
                    className={`absolute bottom-1 h-1 w-1 rounded-full ${
                      selected ? "bg-primaryDark" : "bg-accentSage"
                    }`}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => onSelectDate(null)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              !selectedDate
                ? "bg-white text-primaryDark"
                : "bg-white/10 text-white/80 hover:bg-white/15"
            }`}
          >
            Full month
          </button>
          <button
            type="button"
            onClick={() => {
              onMonthChange(startOfMonth(today));
              onSelectDate(today);
            }}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/15"
          >
            Jump to today
          </button>
          <p className="ml-auto text-[11px] text-white/45">
            Darker cells = higher spend
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTimelineCalendar;
