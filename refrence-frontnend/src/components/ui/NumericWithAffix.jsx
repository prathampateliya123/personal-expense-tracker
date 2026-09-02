import NumericInput from "./NumericInput";

export default function NumericWithAffix({
  affix = "",
  affixPosition = "end",
  className = "",
  inputClassName = "",
  ...numericProps
}) {
  const hasAffix = Boolean(affix);
  const padClass = !hasAffix
    ? ""
    : affixPosition === "start"
      ? "pl-6"
      : "pr-8";

  return (
    <div className={`relative ${className}`.trim()}>
      {hasAffix && affixPosition === "start" ? (
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-[var(--ink-subtle)]">
          {affix}
        </span>
      ) : null}
      <NumericInput {...numericProps} className={`${inputClassName} ${padClass}`.trim()} />
      {hasAffix && affixPosition === "end" ? (
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-[var(--ink-muted)]">
          {affix}
        </span>
      ) : null}
    </div>
  );
}