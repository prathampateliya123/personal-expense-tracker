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
        setTimeline(timelineRes.data.timeline ?? []);
        setMemories(memoriesRes.data.memories ?? []);
        setHeatmap(heatmapRes.data.heatmap ?? []);
        setMaxAmount(heatmapRes.data.maxAmount ?? 0);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load timeline");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month, year, heatmapYear]);

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-heading">Expense Timeline</h1>
        <p className="page-subheading">
          Browse your spending history day by day
        </p>
      </div>

      {/* On This Day memories */}
      {memories.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-textMuted">
            On This Day
          </h2>
          {memories.map((memory) => (
            <div
              key={memory.yearsAgo}
              className="card border-secondary/30 bg-secondary/5 p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary/15 text-lg">
                  🕐
                </div>
                <div>
                  <p className="font-semibold text-primary">
                    {memory.yearsAgo} year{memory.yearsAgo > 1 ? "s" : ""} ago
                    today
                  </p>
                  <p className="mt-1 text-sm text-textSecondary">
                    You spent{" "}
                    <span className="font-bold text-textPrimary">
                      {formatCurrency(memory.totalSpent)}
                    </span>{" "}
                    on {(memory.expenses ?? []).length} expense
                    {(memory.expenses ?? []).length > 1 ? "s" : ""}
                    {memory.topExpense && (
                      <>
                        {" "}
                        — top: {memory.topExpense.title} (
                        {formatCurrency(memory.topExpense.amount)})
                      </>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-textMuted">
                    {formatDayHeader(memory.date)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar heatmap */}
      <div className="card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-heading">Spending Heatmap</h2>
          <select
            value={heatmapYear}
            onChange={(e) => setHeatmapYear(parseInt(e.target.value, 10))}
            className="input-field w-auto"
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
      <div className="card p-6">
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <h2 className="section-heading">Timeline</h2>
          <div className="ml-auto flex gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="input-field w-auto"
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
              className="input-field w-auto"
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
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : timeline.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-textMuted">No expenses this month</p>
          </div>
        ) : (
          <div className="relative space-y-0">
            {/* Vertical line */}
            <div className="absolute bottom-0 left-[7px] top-2 w-0.5 bg-primary/20" />

            {timeline.map((day) => (
              <div key={day.date} className="relative pb-8 pl-8">
                {/* Timeline dot */}
                <div className="absolute left-0 top-2 h-4 w-4 rounded-full border-2 border-primary bg-surface" />

                {/* Day header */}
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2">
                  <h3 className="text-sm font-semibold text-textPrimary">
                    {formatDayHeader(day.date)}
                  </h3>
                  <span className="text-sm font-bold text-expense">
                    {formatCurrency(day.totalAmount)}
                  </span>
                </div>

                {/* Expense items */}
                <div className="space-y-2">
                  {(day.expenses ?? []).map((exp) => (
                    <div
                      key={exp._id}
                      className="flex items-center justify-between rounded-lg bg-background px-4 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-textPrimary">
                          {exp.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="badge-primary">{exp.category}</span>
                          <span className="text-xs capitalize text-textMuted">
                            {exp.paymentMode}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-expense">
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
