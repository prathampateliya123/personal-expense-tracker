export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "lg",
  loading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) {
  const variants = {
    primary:
      "bg-[var(--brand-orange)] text-white hover:opacity-90 disabled:opacity-70",
    secondary:
      "border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--canvas)] disabled:opacity-50",
    ghost:
      "bg-transparent text-[var(--ink)] hover:bg-[var(--canvas)] disabled:opacity-50",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
  };

  const sizes = {
    xs: "h-[32px] px-3 text-[12px]",
    sm: "h-[36px] sm:h-[38px] px-3.5 sm:px-4 text-[12px] sm:text-[13px]",
    md: "h-[40px] sm:h-[42px] px-3.5 sm:px-4 text-[13px] sm:text-[14px]",
    lg: "h-[46px] sm:h-[50px] px-[14px] text-[14px] sm:text-[15px]"
  };

  const spinnerBorder =
    variant === "primary" || variant === "danger"
      ? "border-white/30 border-t-white"
      : "border-[var(--ink)]/20 border-t-[var(--ink)]";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[7px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${sizes[size] || sizes.lg} ${fullWidth ? "w-full" : ""} ${className}`.trim()}
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