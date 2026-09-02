import { useMemo } from "react";

export default function SyncProgress({
  value = 0,
  size = 36,
  strokeWidth = 3.5,
  showLabel = true,
  label = "Sync"
}) {
  const percentage = Number.isFinite(Number(value))
    ? Math.min(100, Math.max(0, Math.round(Number(value))))
    : 0;

  const radius = useMemo(
    () => Math.max((size - strokeWidth) / 2, 0),
    [size, strokeWidth]
  );
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percentage / 100);

  // Keep "100%" inside the ring with padding from the stroke.
  const innerDiameter = Math.max(size - strokeWidth * 2 - 6, 12);
  const percentFontSize = Math.min(11, Math.max(8, Math.floor(innerDiameter * 0.42)));

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className="relative inline-flex items-center justify-center"
        style={{ width: size, height: size }}
        title={`${label}: ${percentage}%`}
        aria-label={`${label}: ${percentage}%`}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--brand-orange)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <span
          className="pointer-events-none absolute inset-[18%] flex items-center justify-center text-center font-bold tabular-nums leading-none tracking-tight text-[var(--ink)]"
          style={{ fontSize: percentFontSize }}
        >
          {percentage}%
        </span>
      </span>

      {showLabel ? (
        <span className="text-[13px] font-semibold text-[var(--ink)]/70">{label}</span>
      ) : null}
    </div>
  );
}
