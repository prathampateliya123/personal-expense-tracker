import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ExpenseTimelineCalendar from "../components/timeline/ExpenseTimelineCalendar";
import ExpenseTimelineFeed, {
  formatTimelineDayLabel,
} from "../components/timeline/ExpenseTimelineFeed";
import { IconPlus } from "../components/ui/Icons";
import expenseService from "../services/expenseService";
import categoryService from "../services/categoryService";
import { expenseKeys, categoryKeys } from "../services/queryKeys";
import { buildCategoryColorMap } from "../utils/categoryColors";
import {
  formatIsoDate,
  startOfMonth,
  toDateOnly,
} from "../utils/dateRange";
import { formatCurrency } from "../utils/formatters";

const ExpenseTimeline = () => {
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(null);

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth() + 1;

  const timelineQuery = useQuery({
    queryKey: expenseKeys.timeline({ year, month }),
    queryFn: () => expenseService.getTimeline({ year, month }),
  });

  const categoriesQuery = useQuery({
    queryKey: categoryKeys.options("expense"),
    queryFn: async () => {
      const data = await categoryService.options("expense");
      return data.categories ?? [];
    },
  });

  const colorMap = useMemo(
    () => buildCategoryColorMap(categoriesQuery.data ?? []),
    [categoriesQuery.data]
  );

  const days = timelineQuery.data?.days ?? [];
  const dayTotals = timelineQuery.data?.dayTotals ?? {};
  const monthTotal = timelineQuery.data?.monthTotal ?? 0;
  const monthCount = timelineQuery.data?.monthCount ?? 0;
  const selectedDateKey = selectedDate ? formatIsoDate(selectedDate) : null;

  useEffect(() => {
    if (!selectedDateKey) return;
    const el = document.getElementById(`timeline-day-${selectedDateKey}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedDateKey, days]);

  const handleMonthChange = (nextMonth) => {
    setMonthDate(startOfMonth(nextMonth));
    setSelectedDate(null);
  };

  const handleSelectDate = (day) => {
    if (!day) {
      setSelectedDate(null);
      return;
    }
    const next = toDateOnly(day);
    if (selectedDate && formatIsoDate(selectedDate) === formatIsoDate(next)) {
      setSelectedDate(null);
      return;
    }
    setSelectedDate(next);
  };

  const headerHint = selectedDateKey
    ? `Showing ${formatTimelineDayLabel(selectedDateKey)}`
    : "Chronological view for the month";

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accentGreen">
            Expense timeline
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
            Day by day spend
          </h1>
          <p className="mt-1 text-sm text-textSecondary">{headerHint}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-lg border border-border bg-surfaceLight/70 px-3 py-2 text-sm">
            <span className="text-textSecondary">Month total </span>
            <span className="font-bold text-primaryDark">
              {formatCurrency(monthTotal)}
            </span>
          </div>
          <Link
            to="/expenses/add"
            className="btn-primary inline-flex items-center gap-1.5"
          >
            <IconPlus className="h-4 w-4" />
            Add expense
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
        <ExpenseTimelineCalendar
          monthDate={monthDate}
          onMonthChange={handleMonthChange}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          dayTotals={dayTotals}
          monthTotal={monthTotal}
          monthCount={monthCount}
        />

        <div className="card min-w-0 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-semibold text-textPrimary">
                Timeline
              </h2>
              <p className="text-xs text-textSecondary">
                Newest days first · amount + category at a glance
              </p>
            </div>
            {selectedDateKey ? (
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="text-xs font-semibold text-accentGreen hover:text-primaryMid"
              >
                Clear day filter
              </button>
            ) : null}
          </div>

          <ExpenseTimelineFeed
            days={days}
            loading={timelineQuery.isLoading || timelineQuery.isFetching}
            colorMap={colorMap}
            selectedDateKey={selectedDateKey}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpenseTimeline;
