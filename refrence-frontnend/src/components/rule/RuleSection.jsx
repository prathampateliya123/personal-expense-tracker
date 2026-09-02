export default function RuleSection({
  title,
  description,
  children,
  className = "",
  contentClassName = "",
  splitHeader = true
}) {
  const hasHeader = Boolean(title || description);
  const bare = className.includes("border-0") || className.includes("bg-transparent");

  if (bare || !splitHeader) {
    return (
      <section
        className={`overflow-visible rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-4 ${className}`.trim()}
      >
        {hasHeader ? (
          <div className="mb-4">
            {title ? (
              <h2 className="text-[20px] font-semibold tracking-tight text-[var(--ink)] sm:text-[22px]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-[14px] leading-snug text-[var(--ink-muted)]">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
        {children}
      </section>
    );
  }

  return (
    <section className={`space-y-3 ${className}`.trim()}>
      {hasHeader ? (
        <header className="shrink-0 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 sm:px-6 sm:py-5">
          {title ? (
            <h2 className="text-[18px] font-semibold tracking-tight text-[var(--ink)] sm:text-[22px] lg:text-[24px]">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-1 max-w-2xl text-[13px] leading-snug text-[var(--ink-muted)] sm:mt-1.5 sm:text-[15px]">
              {description}
            </p>
          ) : null}
        </header>
      ) : null}

      <div
        className={`h-fit rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-5 ${contentClassName}`.trim()}
      >
        {children}
      </div>
    </section>
  );
}