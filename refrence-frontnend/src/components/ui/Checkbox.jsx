import { useId } from "react";

const CHECK_MARK_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='3.5 8.5 6.5 11.5 12.5 4.5'/%3E%3C/svg%3E\")";

const CHECKBOX_CLASS =
  "h-4 w-4 shrink-0 appearance-none rounded-[4px] border border-[var(--border-strong)] bg-[var(--surface)] checked:border-[var(--brand-orange)] checked:bg-[var(--brand-orange)]";

export default function Checkbox({
  id,
  label,
  checked = false,
  onChange,
  disabled = false,
  className = "",
  inputClassName = "",
  ...props
}) {
  const generatedId = useId();
  const checkboxId = id || generatedId;

  return (
    <label
      htmlFor={checkboxId}
      className={`inline-flex w-fit items-center gap-2 ${disabled ? "cursor-default opacity-60" : "cursor-pointer"
        } ${className}`.trim()}
    >
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked, event)}
        className={`${CHECKBOX_CLASS} ${disabled ? "cursor-default" : "cursor-pointer"
          } ${inputClassName}`.trim()}
        style={{
          backgroundImage: checked ? CHECK_MARK_SVG : "none",
          backgroundSize: "12px 12px",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
        {...props}
      />
      {label ? (
        typeof label === "string" ? (
          <span className="text-[13px] font-medium text-[var(--ink)]">{label}</span>
        ) : (
          label
        )
      ) : null}
    </label>
  );
}