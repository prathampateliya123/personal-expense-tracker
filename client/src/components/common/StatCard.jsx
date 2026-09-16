export const StatCard = ({
  label,
  value,
  hint,
  hero = false,
  danger = false,
}) => (
  <div
    className={`card flex min-h-[96px] w-full flex-col justify-center p-5 sm:p-6 ${
      hero ? "gradient-green-card text-white" : ""
    }`}
  >
    <p
      className={`text-xs font-medium uppercase tracking-wide ${
        hero ? "text-accentGreen" : "text-textSecondary"
      }`}
    >
      {label}
    </p>
    <p
      className={`mt-1 font-pixel text-lg font-normal sm:text-xl ${
        hero
          ? "text-white"
          : danger
            ? "text-red-500"
            : "text-primaryDark"
      }`}
    >
      {value}
    </p>
    {hint ? (
      <p
        className={`mt-1 text-xs ${
          hero ? "text-white/70" : "text-textSecondary"
        }`}
      >
        {hint}
      </p>
    ) : null}
  </div>
);

export default StatCard;
