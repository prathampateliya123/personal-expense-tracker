export default function SelectableTile({
  title,
  description,
  selected = false,
  disabled = false,
  onClick,
  className = "",
  compact = false,
  role = "button",
  "aria-checked": ariaChecked
}) {
  const selectedLook =
    "border-[var(--brand-orange)] bg-[rgba(246,143,61,0.08)] text-[var(--ink)]";
  const idleLook =
    "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--canvas)]";
  const mutedLook = "border-[var(--border)] bg-[var(--canvas)] opacity-55";

  let shellClass;
  if (disabled && selected) {
    shellClass = `cursor-default ${selectedLook}`;
  } else if (disabled) {
    shellClass = `cursor-not-allowed ${mutedLook}`;
  } else if (selected) {
    shellClass = `cursor-pointer ${selectedLook}`;
  } else {
    shellClass = `cursor-pointer ${idleLook}`;
  }

  return (
    <button
      type="button"
      role={role}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={role === "button" ? selected : undefined}
      aria-checked={role === "radio" ? Boolean(ariaChecked ?? selected) : undefined}
      className={`w-full rounded-[8px] border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 ${compact ? "px-3.5 py-3" : "px-4 py-4"
        } ${shellClass} ${className}`.trim()}
    >
      <div className={`flex h-full items-start ${compact ? "gap-2.5" : "gap-3"}`}>
        <span
          className={`flex shrink-0 items-center justify-center rounded-full border ${compact ? "mt-0.5 h-3.5 w-3.5" : "mt-0.5 h-4 w-4"
            } ${selected
              ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]"
              : "border-[var(--border-strong)] bg-[var(--surface)]"
            }`}
          aria-hidden
        >
          {selected ? (
            <span className={`rounded-full bg-white ${compact ? "h-1 w-1" : "h-1.5 w-1.5"}`} />
          ) : null}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={`font-semibold leading-snug ${compact ? "text-[13px]" : "text-[15px]"
              } ${disabled && !selected ? "text-[var(--ink-muted)]" : "text-[var(--ink)]"}`}
          >
            {title}
          </p>
          {description ? (
            <p
              className={`leading-snug text-[var(--ink-muted)] ${compact ? "mt-0.5 text-[11px]" : "mt-1.5 text-[13px]"
                }`}
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </button>
  );
}