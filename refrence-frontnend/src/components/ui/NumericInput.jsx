import {
  numericInputMode,
  sanitizeIntegerInput,
  sanitizeNumericInput
} from "../../utils/numericInput";

export default function NumericInput({
  value = "",
  onChange,
  allowDecimal = true,
  allowNegative = false,
  maxDecimals,
  integer = false,
  className = "",
  ...props
}) {
  const decimals = integer ? false : allowDecimal;
  const sanitize = (raw) =>
    decimals
      ? sanitizeNumericInput(raw, { allowNegative, allowDecimal: true, maxDecimals })
      : sanitizeIntegerInput(raw, { allowNegative });

  const display = sanitize(value);

  return (
    <input
      {...props}
      type="text"
      inputMode={numericInputMode(integer ? "integer" : "decimal", decimals)}
      autoComplete="off"
      spellCheck={false}
      value={display}
      onChange={(event) => {
        onChange?.(sanitize(event.target.value));
      }}
      className={className}
    />
  );
}