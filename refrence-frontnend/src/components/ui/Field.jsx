import { useRef, useState } from "react";
import FieldErrorTooltip from "./FieldErrorTooltip";
import Tooltip from "./Tooltip";
import { InfoCircleIcon } from "./Icons";

export function Label({ htmlFor, required = false, className = "", children }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`mb-1.5 sm:mb-2 ml-0.5 sm:ml-1 block text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--ink)] ${className}`.trim()}
    >
      {children}
      {required ? <span className="text-red-500">*</span> : null}
    </label>
  );
}

function LabelInfo({ content, label }) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  if (!content) return null;

  return (
    <span className="relative inline-flex items-center">
      <button
        ref={anchorRef}
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[var(--ink-muted)] transition-colors hover:text-[var(--brand-orange)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]"
        aria-label={label || "More information"}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <InfoCircleIcon className="h-3.5 w-3.5" />
      </button>
      <Tooltip open={open} content={content} anchorRef={anchorRef} prefer="top" />
    </span>
  );
}

export default function Field({
  id,
  label,
  required = false,
  error = false,
  errorMessage = "",
  errorId,
  errorDisplay = "tooltip",
  hint,
  info,
  infoLabel,
  layout = "stack",
  className = "",
  children
}) {
  const labelNode = label ? (
    <div
      className={
        layout === "inline"
          ? "flex items-center gap-1.5"
          : "mb-1.5 sm:mb-2 ml-0.5 sm:ml-1 flex items-center gap-1.5"
      }
    >
      <label
        htmlFor={id}
        className={
          layout === "inline"
            ? "text-[14px] font-medium uppercase text-[var(--ink)]"
            : "block text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--ink)]"
        }
      >
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </label>
      <LabelInfo content={info} label={infoLabel || `About ${label}`} />
    </div>
  ) : null;

  const control = (
    <div className="relative min-w-0">
      {children}
      {errorDisplay === "tooltip" ? (
        <FieldErrorTooltip id={errorId} show={Boolean(error && errorMessage)} message={errorMessage} />
      ) : null}
      {errorDisplay === "text" && error && errorMessage ? (
        <p id={errorId} className="mt-1 text-[12px] font-medium text-red-500">
          {errorMessage}
        </p>
      ) : null}
      {hint && !error ? (
        <p className="mt-1.5 text-[12px] text-[var(--ink-muted)]">{hint}</p>
      ) : null}
    </div>
  );

  if (!label) {
    return <div className={className}>{control}</div>;
  }

  if (layout === "inline") {
    return (
      <div
        className={`grid grid-cols-1 items-center gap-2 px-4 py-4 sm:grid-cols-[180px_1fr] sm:gap-6 sm:px-5 ${className}`.trim()}
      >
        {labelNode}
        {control}
      </div>
    );
  }

  return (
    <div className={className}>
      {labelNode}
      {control}
    </div>
  );
}