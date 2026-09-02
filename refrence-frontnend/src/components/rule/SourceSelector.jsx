import { useMemo } from "react";
import FieldErrorTooltip from "../ui/FieldErrorTooltip";

export default function SourceSelector({ value, options = [], error, onChange, readOnly = false }) {
  const sourceOptions = useMemo(() => options || [], [options]);

  return (
    <div id="source" className="relative">
      <div className="mb-3">
        <h3 className="text-[15px] font-semibold text-[var(--ink)]">Select Source</h3>
        <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
          Choose the data source for your automation rule
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {sourceOptions.map((source) => {
            const selected = source.name === value;

            return (
              <button
                key={source.name}
                type="button"
                disabled={readOnly}
                onClick={() => {
                  if (readOnly) return;
                  onChange?.(source.name);
                }}
                className={`flex h-full min-w-0 items-start gap-3 rounded-[10px] border bg-[var(--surface)] p-3.5 text-left transition-[border-color,box-shadow,background-color] duration-200 ${readOnly ? "cursor-default" : "cursor-pointer"
                  } ${selected
                    ? "border-[var(--brand-orange)] shadow-[0_0_0_3px_rgba(246,143,61,0.12)]"
                    : error
                      ? "border-red-500"
                      : readOnly
                        ? "border-[var(--border)] opacity-70"
                        : "border-[var(--border)] hover:border-[var(--border-strong)] hover:shadow-[0_6px_18px_rgba(17,24,39,0.06)]"
                  }`}
                aria-label={`Select source ${source.name}`}
              >
                <span
                  className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${selected ? "border-[var(--brand-orange)]" : "border-[var(--border-strong)]"
                    }`}
                  aria-hidden
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${selected ? "bg-[var(--brand-orange)]" : "bg-transparent"
                      }`}
                  />
                </span>

                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-[var(--ink)] leading-snug sm:text-[14px]">
                    {source.name}
                  </span>
                  <span className="mt-1 block text-[12px] leading-relaxed text-[var(--ink-muted)]">
                    {source.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <FieldErrorTooltip id="source-error" show={Boolean(error)} message={error} />
      </div>
    </div>
  );
}