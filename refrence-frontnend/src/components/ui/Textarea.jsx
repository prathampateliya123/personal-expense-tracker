import { forwardRef, useId } from "react";
import Field from "./Field";

const Textarea = forwardRef(function Textarea(
  {
    id,
    label,
    required = false,
    error = false,
    errorMessage = "",
    errorDisplay = "tooltip",
    hint,
    layout = "stack",
    rows = 4,
    className = "",
    textareaClassName = "",
    ...props
  },
  ref
) {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const errorId = errorMessage ? `${textareaId}-error` : undefined;
  const isReadOnly = props.readOnly;
  const borderClass = error
    ? "border-red-500 focus:border-red-500"
    : isReadOnly
      ? "border-[var(--border)]"
      : "border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--brand-orange)] focus:shadow-[0_0_0_3px_rgba(246,143,61,0.12)]";

  return (
    <Field
      id={textareaId}
      label={label}
      required={required}
      error={error}
      errorMessage={errorMessage}
      errorId={errorId}
      errorDisplay={errorDisplay}
      hint={hint}
      layout={layout}
      className={className}
    >
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={error || undefined}
        aria-describedby={error && errorId ? errorId : undefined}
        className={`w-full resize-none rounded-[7px] border bg-[var(--surface)] px-3.5 py-3 text-[13px] text-[var(--ink)] outline-none transition-all placeholder:text-[var(--ink-subtle)] disabled:cursor-not-allowed disabled:opacity-60 ${borderClass} ${textareaClassName}`.trim()}
        {...props}
      />
    </Field>
  );
});

export default Textarea;