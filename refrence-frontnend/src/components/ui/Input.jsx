import { forwardRef, useId } from "react";
import Field from "./Field";
import {
  isNumericInputType,
  numericInputMode,
  sanitizeIntegerInput,
  sanitizeNumericInput
} from "../../utils/numericInput";

const Input = forwardRef(function Input(
  {
    id,
    label,
    required = false,
    error = false,
    errorMessage = "",
    errorDisplay = "tooltip",
    hint,
    info,
    infoLabel,
    layout = "stack",
    size = "lg",
    className = "",
    inputClassName = "",
    numeric,
    type = "text",
    value,
    onChange,
    inputMode,
    autoComplete,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = errorMessage ? `${inputId}-error` : undefined;
  const sizeClass =
    size === "md"
      ? "h-[42px] sm:h-[44px] px-3 sm:px-[14px] text-[13px] sm:text-[14px]"
      : "h-[46px] sm:h-[50px] px-3 sm:px-[14px] py-2.5 sm:py-[12px] text-[13px] sm:text-[14px]";
  const borderClass = error
    ? "border-red-500 focus:border-red-500"
    : "border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--brand-orange)]";

  const numericEnabled = isNumericInputType(type, numeric);
  const integerOnly = numeric === "integer" || (numericEnabled && numeric !== "decimal" && type === "number");
  const allowNegative = props.min == null || Number(props.min) < 0;
  const sanitize = (raw) =>
    integerOnly
      ? sanitizeIntegerInput(raw, { allowNegative })
      : sanitizeNumericInput(raw, { allowNegative, allowDecimal: true });

  const displayValue = numericEnabled ? sanitize(value ?? "") : value;

  const handleChange = (event) => {
    if (!numericEnabled) {
      onChange?.(event);
      return;
    }
    const next = sanitize(event.target.value);
    onChange?.({
      ...event,
      target: { ...event.target, value: next, name: event.target.name }
    });
  };

  return (
    <Field
      id={inputId}
      label={label}
      required={required}
      error={error}
      errorMessage={errorMessage}
      errorId={errorId}
      errorDisplay={errorDisplay}
      hint={hint}
      info={info}
      infoLabel={infoLabel}
      layout={layout}
      className={className}
    >
      <input
        {...props}
        ref={ref}
        id={inputId}
        type={numericEnabled ? "text" : type}
        inputMode={numericEnabled ? numericInputMode(integerOnly ? "integer" : "decimal", !integerOnly) : inputMode}
        autoComplete={numericEnabled ? autoComplete || "off" : autoComplete}
        spellCheck={numericEnabled ? false : undefined}
        value={displayValue}
        onChange={handleChange}
        aria-invalid={error || undefined}
        aria-describedby={error && errorId ? errorId : undefined}
        className={`w-full rounded-[7px] border bg-[var(--surface)] text-[var(--ink)] outline-none transition-all placeholder:text-[var(--ink-subtle)] disabled:cursor-not-allowed disabled:opacity-60 ${sizeClass} ${borderClass} ${inputClassName}`.trim()}
      />
    </Field>
  );
});

export default Input;