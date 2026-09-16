const SIZE = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-16 w-16",
  xl: "h-28 w-28 sm:h-36 sm:w-36",
  full: "h-auto w-full max-w-[280px] sm:max-w-[320px]",
};

/**
 * Brand mark from /logo.png.
 * - mark: compact square crop for nav/header
 * - full: full logo lockup (icon + wordmark)
 */
const BrandLogo = ({
  variant = "mark",
  size = "md",
  className = "",
  alt = "Expense Tracker",
}) => {
  if (variant === "full") {
    return (
      <img
        src="/logo.png"
        alt={alt}
        className={`block object-contain ${SIZE[size] || SIZE.full} ${className}`}
        draggable={false}
      />
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-xl border-2 border-primaryDark bg-primaryDark ${SIZE[size] || SIZE.md} ${className}`}
    >
      <img
        src="/logo.png"
        alt={alt}
        className="h-full w-full scale-[1.35] object-cover object-[center_28%]"
        draggable={false}
      />
    </span>
  );
};

export default BrandLogo;
