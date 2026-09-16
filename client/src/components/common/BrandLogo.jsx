const SIZE = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-16 w-16",
  xl: "h-28 w-28 sm:h-36 sm:w-36",
  loader: "h-[132px] w-[132px] sm:h-[160px] sm:w-[160px]",
  full: "h-auto w-full max-w-[240px] sm:max-w-[280px]",
};

/**
 * Brand mark assets:
 * - icon: wallet crop (/logo-icon.png) — favicon / loader / sidebar
 * - mark: cropped full logo fallback
 * - full: complete lockup
 */
const BrandLogo = ({
  variant = "mark",
  size = "md",
  className = "",
  alt = "Expense Tracker",
}) => {
  const box = SIZE[size] || SIZE.md;

  if (variant === "full") {
    return (
      <img
        src="/logo.png"
        alt={alt}
        width={280}
        height={280}
        className={`block object-contain ${box} ${className}`}
        draggable={false}
      />
    );
  }

  if (variant === "icon") {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-accentGreen/40 bg-primaryDark ${box} ${className}`}
      >
        <img
          src="/logo-icon.png"
          alt={alt}
          width={160}
          height={160}
          className="h-full w-full object-contain p-1"
          draggable={false}
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-xl border-2 border-primaryDark bg-primaryDark ${box} ${className}`}
    >
      <img
        src="/logo-icon.png"
        alt={alt}
        width={44}
        height={44}
        className="h-full w-full object-contain"
        draggable={false}
      />
    </span>
  );
};

export default BrandLogo;
