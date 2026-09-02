import TableTruncate from "./TableTruncate";
import { formatPercent, formatReportNumber } from "../../utils/helper";

function formatSummaryValue(value, format = "number") {
  if (value == null || value === "") return "—";

  switch (format) {
    case "integer":
      return formatReportNumber(value, 0);
    case "percent":
      return formatPercent(value);
    case "number":
    default:
      return formatReportNumber(value);
  }
}

export default function TableSummary({
  summary = null,
  metrics = [],
  isFetching = false
}) {
  if (!Array.isArray(metrics) || !metrics.length) return null;

  const hasAnyValue = metrics.some((metric) => {
    const key = metric?.key;
    return key && summary && summary[key] != null && summary[key] !== "";
  });

  if (!summary && !hasAnyValue && !isFetching) return null;

  return (
    <div
      className={`rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 sm:px-4 sm:py-3.5 shadow-[0_1px_2px_rgba(17,24,39,0.04)] ${isFetching ? "opacity-70" : ""
        }`}
      aria-busy={isFetching || undefined}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-muted)]">
          Overview
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {metrics.map((metric) => {
          const key = String(metric.key || "");
          const label = metric.label || key;
          const raw = summary?.[key];
          const display =
            !summary && isFetching ? "…" : formatSummaryValue(raw, metric.format);

          return (
            <div
              key={key}
              className="min-w-0 grow basis-[calc(50%-0.25rem)] rounded-[7px] border border-[var(--border)] bg-[var(--canvas)] px-3 py-2.5 sm:px-3.5 sm:py-3 md:basis-[calc(25%-0.375rem)]"
            >
              <p className="truncate text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--ink-muted)]">
                {label}
              </p>
              <div className="mt-1 min-w-0 text-[16px] sm:text-[18px] font-semibold tabular-nums text-[var(--ink)]">
                <TableTruncate value={display} maxWidthClass="max-w-full" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}