/**
 * components/dashboard/CircularProgress.jsx
 * Spend vs remaining ring with dotted unfilled track.
 */

const CircularProgress = ({ percent = 0, label = "Spent", size = 140 }) => {
  const clamped = Math.min(100, Math.max(0, percent));
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F1F3F5"
          strokeWidth={stroke}
          strokeDasharray="4 6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0D3B2E" />
            <stop offset="100%" stopColor="#22A96C" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-primaryDark">{clamped}%</span>
        <span className="text-xs text-textSecondary">{label}</span>
      </div>
    </div>
  );
};

export default CircularProgress;
