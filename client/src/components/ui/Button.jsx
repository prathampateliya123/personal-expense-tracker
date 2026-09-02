/**
 * components/ui/Button.jsx
 * Reusable button — primary green fintech theme.
 */

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) {
  const variants = {
    primary:
      "bg-primaryDark text-white hover:bg-primaryMid disabled:opacity-70",
    secondary:
      "border border-border bg-white text-textPrimary hover:bg-surfaceLight disabled:opacity-50",
    ghost:
      "bg-transparent text-textPrimary hover:bg-surfaceLight disabled:opacity-50",
    danger: "bg-red-500 text-white hover:bg-red-600 disabled:opacity-60",
  };

  const sizes = {
    xs: "h-8 px-3 text-xs",
    sm: "h-9 px-3.5 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base",
  };

  const spinnerBorder =
    variant === "primary" || variant === "danger"
      ? "border-white/30 border-t-white"
      : "border-textPrimary/20 border-t-textPrimary";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentGreen focus-visible:ring-offset-2 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${fullWidth ? "w-full" : ""} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <span
          className={`inline-flex h-5 w-5 shrink-0 animate-spin rounded-full border-[3px] ${spinnerBorder}`}
          aria-hidden
        />
      ) : (
        children
      )}
    </button>
  );
}
