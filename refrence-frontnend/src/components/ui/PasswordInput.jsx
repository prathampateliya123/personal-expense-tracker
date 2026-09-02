import { forwardRef, useId, useState } from "react";
import { EyeClosedIcon, EyeOpenIcon } from './Icons';
import Field from "./Field";

const PasswordInput = forwardRef(function PasswordInput(
  {
    id,
    label,
    required = false,
    error = false,
    errorMessage = "",
    errorDisplay = "tooltip",
    hint,
    layout = "stack",
    size = "lg",
    className = "",
    inputClassName = "",
    visible: visibleProp,
    defaultVisible = false,
    onVisibilityChange,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = errorMessage ? `${inputId}-error` : undefined;
  const [uncontrolledVisible, setUncontrolledVisible] = useState(defaultVisible);
  const visible = typeof visibleProp === "boolean" ? visibleProp : uncontrolledVisible;
  const sizeClass =
    size === "md"
      ? "h-[42px] sm:h-[44px] px-3 sm:px-[14px] text-[13px] sm:text-[14px]"
      : "h-[46px] sm:h-[50px] px-3 sm:px-[14px] py-2.5 sm:py-[12px] text-[13px] sm:text-[14px]";
  const borderClass = error
    ? "border-red-500 focus:border-red-500"
    : "border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--brand-orange)]";

  const setVisible = (next) => {
    if (typeof visibleProp !== "boolean") setUncontrolledVisible(next);
    onVisibilityChange?.(next);
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
      layout={layout}
      className={className}
    >
      <div className="relative w-full">
        <input
          ref={ref}
          id={inputId}
          type={visible ? "text" : "password"}
          aria-invalid={error || undefined}
          aria-describedby={error && errorId ? errorId : undefined}
          className={`w-full rounded-[7px] border bg-[var(--surface)] pr-11 sm:pr-12 text-[var(--ink)] outline-none transition-all placeholder:text-[var(--ink-subtle)] disabled:cursor-not-allowed disabled:opacity-60 ${sizeClass} ${borderClass} ${inputClassName}`.trim()}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <EyeOpenIcon /> : <EyeClosedIcon />}
        </button>
      </div>
    </Field>
  );
});

export default PasswordInput;