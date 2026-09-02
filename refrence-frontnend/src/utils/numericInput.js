import {
  COMMA_REGEX,
  DOT_REGEX,
  LEADING_MINUS_REGEX,
  NON_NUMERIC_INPUT_REGEX
} from "./constants";

export function sanitizeNumericInput(
  raw,
  { allowNegative = false, allowDecimal = true, maxDecimals } = {}
) {
  let str = String(raw ?? "").replace(COMMA_REGEX, "");
  if (!str) return "";

  let negative = false;
  if (allowNegative && str.trim().startsWith("-")) {
    negative = true;
    str = str.replace(LEADING_MINUS_REGEX, "");
  }

  str = str.replace(NON_NUMERIC_INPUT_REGEX, "");

  if (!allowDecimal) {
    str = str.replace(DOT_REGEX, "");
  } else {
    const dot = str.indexOf(".");
    if (dot !== -1) {
      str = `${str.slice(0, dot + 1)}${str.slice(dot + 1).replace(DOT_REGEX, "")}`;
      if (Number.isInteger(maxDecimals) && maxDecimals >= 0) {
        const [whole, frac = ""] = str.split(".");
        str = `${whole}.${frac.slice(0, maxDecimals)}`;
      }
    }
  }

  if (negative) return str ? `-${str}` : "-";
  return str;
}

export function sanitizeIntegerInput(raw, { allowNegative = false } = {}) {
  return sanitizeNumericInput(raw, { allowNegative, allowDecimal: false });
}

export function isNumericInputType(type, numeric) {
  if (numeric === false) return false;
  if (numeric === true || numeric === "integer" || numeric === "decimal") return true;
  return String(type || "").toLowerCase() === "number";
}

export function numericInputMode(numeric, allowDecimal) {
  if (numeric === "integer" || allowDecimal === false) return "numeric";
  return "decimal";
}