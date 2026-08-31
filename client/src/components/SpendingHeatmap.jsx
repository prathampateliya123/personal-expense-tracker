/**
 * components/SpendingHeatmap.jsx
 * GitHub-style calendar heatmap built with TailwindCSS.
 * Darker primary = higher daily spend.
 */

const INTENSITY_CLASSES = [
  "bg-border",
  "bg-secondary/25",
  "bg-secondary/50",
  "bg-primary/60",
  "bg-primary",
];

const getIntensityClass = (amount, maxAmount) => {
  if (amount === 0 || maxAmount === 0) return INTENSITY_CLASSES[0];
  const ratio = amount / maxAmount;
  if (ratio <= 0.25) return INTENSITY_CLASSES[1];
  if (ratio <= 0.5) return INTENSITY_CLASSES[2];
  if (ratio <= 0.75) return INTENSITY_CLASSES[3];
  return INTENSITY_CLASSES[4];
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SpendingHeatmap = ({ heatmap, maxAmount, year }) => {
  if (!heatmap?.length) {
    return (
      <p className="text-sm text-textMuted">No spending data for {year}</p>
    );
  }

  // Organize into weeks (columns) starting from first day of year
  const firstDay = new Date(year, 0, 1).getDay(); // 0=Sun
  const weeks = [];
  let currentWeek = new Array(firstDay).fill(null);

  heatmap.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex min-w-full flex-col gap-1">
        {/* Month labels */}
        <div className="ml-8 flex gap-0">
          {MONTH_LABELS.map((label, i) => (
            <span
              key={label}
              className="text-[10px] text-textMuted"
              style={{ width: `${(weeks.length / 12) * 14}px`, minWidth: "28px" }}
            >
              {i % 2 === 0 ? label : ""}
            </span>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-[3px] pr-1 pt-0.5">
            {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => (
              <span key={i} className="h-[12px] text-[9px] leading-[12px] text-textMuted">
                {label}
              </span>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) =>
                  day ? (
                    <div
                      key={day.date}
                      title={`${day.date}: ${formatCurrency(day.amount)}`}
                      className={`h-[12px] w-[12px] rounded-sm ${getIntensityClass(day.amount, maxAmount)} transition hover:ring-2 hover:ring-primaryGlow/40`}
                    />
                  ) : (
                    <div key={`empty-${wi}-${di}`} className="h-[12px] w-[12px]" />
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="ml-8 mt-2 flex items-center gap-2">
          <span className="text-[10px] text-textMuted">Less</span>
          {INTENSITY_CLASSES.map((cls) => (
            <div key={cls} className={`h-[10px] w-[10px] rounded-sm ${cls}`} />
          ))}
          <span className="text-[10px] text-textMuted">More</span>
        </div>
      </div>
    </div>
  );
};

export default SpendingHeatmap;
