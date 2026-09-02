import Button from "../ui/Button";

export function TableSkeleton({ rows = 7, className = "", showToolbarPulse = false }) {
  return (
    <div
      className={`space-y-2.5 px-4 py-5 sm:px-5 ${className}`}
      aria-busy="true"
      aria-label="Loading"
    >
      {showToolbarPulse ? (
        <div className="mb-3 h-9 w-full max-w-sm animate-pulse rounded-[7px] bg-[var(--border)]/70" />
      ) : null}
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3"
          style={{ opacity: 1 - index * 0.06 }}
        >
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-[7px] bg-[var(--border)]/60" />
          <div className="h-9 min-w-0 flex-1 animate-pulse rounded-[7px] bg-[var(--border)]/55" />
          <div className="hidden h-9 w-24 animate-pulse rounded-[7px] bg-[var(--border)]/50 sm:block" />
          <div className="hidden h-9 w-20 animate-pulse rounded-[7px] bg-[var(--border)]/45 md:block" />
        </div>
      ))}
    </div>
  );
}

export function TableStatusPanel({
  title,
  description,
  actionLabel,
  onAction,
  tone = "muted",
  className = ""
}) {
  const titleClass =
    tone === "error"
      ? "text-[var(--ink)]"
      : "text-[var(--ink-muted)]";

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 px-4 py-14 text-center sm:py-16 ${className}`}
      role={tone === "error" ? "alert" : undefined}
    >
      {title ? (
        <p className={`text-[14px] font-semibold ${titleClass}`}>{title}</p>
      ) : null}
      {description ? (
        <p className="max-w-sm text-[13px] leading-relaxed text-[var(--ink-subtle)]">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <Button type="button" size="sm" className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function TableLoadingSpinner({ label = "Loading...", className = "" }) {
  return (
    <div
      className={`flex min-h-[220px] flex-col items-center justify-center px-4 py-10 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="mb-3 h-9 w-9 animate-spin rounded-full border-[3px] border-[var(--border)] border-t-[var(--brand-orange)]" />
      {label ? <p className="text-[14px] text-[var(--ink-muted)]">{label}</p> : null}
    </div>
  );
}