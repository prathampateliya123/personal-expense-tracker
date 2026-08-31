/**
 * pages/Timeline.jsx
 * Expense timeline with memories, vertical day-grouped view, and spending heatmap.
 */

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import SpendingHeatmap from "../components/SpendingHeatmap";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDayHeader = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const Timeline = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [heatmapYear, setHeatmapYear] = useState(now.getFullYear());

  const [timeline, setTimeline] = useState([]);
  const [memories, setMemories] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [maxAmount, setMaxAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [timelineRes, memoriesRes, heatmapRes] = await Promise.all([
          axiosInstance.get("/timeline/timeline", { params: { month, year } }),
          axiosInstance.get("/timeline/memories"),
          axiosInstance.get("/timeline/heatmap", { params: { year: heatmapYear } }),
        ]);
        setTimeline(timelineRes.data.timeline);
        setMemories(memoriesRes.data.memories);
        setHeatmap(heatmapRes.data.heatmap);
        setMaxAmount(heatmapRes.data.maxAmount);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load timeline");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month, year, heatmapYear]);

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const inputClass =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Expense Timeline</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse your spending history day by day
        </p>
      </div>

      {/* On This Day memories */}
      {memories.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            On This Day
          </h2>
          {memories.map((memory) => (
            <div
              key={memory.yearsAgo}
              className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg">
                  🕐
                </div>
                <div>
                  <p className="font-semibold text-amber-900">
                    {memory.yearsAgo} year{memory.yearsAgo > 1 ? "s" : ""} ago
                    today
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    You spent{" "}
                    <span className="font-bold">
                      {formatCurrency(memory.totalSpent)}
                    </span>{" "}
                    on {memory.expenses.length} expense
                    {memory.expenses.length > 1 ? "s" : ""}
                    {memory.topExpense && (
                      <>
                        {" "}
                        — top: {memory.topExpense.title} (
                        {formatCurrency(memory.topExpense.amount)})
                      </>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-amber-600">
                    {formatDayHeader(memory.date)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar heatmap */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-800">
            Spending Heatmap
          </h2>
          <select
            value={heatmapYear}
            onChange={(e) => setHeatmapYear(parseInt(e.target.value, 10))}
            className={inputClass}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <SpendingHeatmap heatmap={heatmap} maxAmount={maxAmount} year={heatmapYear} />
      </div>

      {/* Timeline view */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <h2 className="text-base font-semibold text-gray-800">Timeline</h2>
          <div className="ml-auto flex gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className={inputClass}
            >
              {MONTHS.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className={inputClass}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : timeline.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-gray-400">No expenses this month</p>
          </div>
        ) : (
          <div className="relative space-y-0">
            {/* Vertical line */}
            <div className="absolute bottom-0 left-[7px] top-2 w-0.5 bg-indigo-100" />

            {timeline.map((day) => (
              <div key={day.date} className="relative pb-8 pl-8">
                {/* Timeline dot */}
                <div className="absolute left-0 top-2 h-4 w-4 rounded-full border-2 border-indigo-400 bg-white" />

                {/* Day header */}
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {formatDayHeader(day.date)}
                  </h3>
                  <span className="text-sm font-bold text-red-600">
                    {formatCurrency(day.totalAmount)}
                  </span>
                </div>

                {/* Expense items */}
                <div className="space-y-2">
                  {day.expenses.map((exp) => (
                    <div
                      key={exp._id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {exp.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                            {exp.category}
                          </span>
                          <span className="text-xs capitalize text-gray-400">
                            {exp.paymentMode}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-red-600">
                        {formatCurrency(exp.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
