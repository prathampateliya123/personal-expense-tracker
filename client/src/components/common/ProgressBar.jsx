export const ProgressBar = ({ percent = 0, over = false }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-surfaceGray">
    <div
      className={`h-full rounded-full transition-all ${
        over ? "bg-red-500" : "bg-accentGreen"
      }`}
      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
    />
  </div>
);

export default ProgressBar;
