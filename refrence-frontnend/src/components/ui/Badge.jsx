import {
  UNDERSCORE_OR_HYPHEN_REGEX,
  WHITESPACE_COLLAPSE_REGEX
} from "../../utils/constants";

const BADGE_VARIANTS = {
  neutral:
    "border-[var(--border)] bg-[var(--canvas)] text-[var(--ink-muted)]",
  brand:
    "border-[var(--brand-orange)]/35 bg-[var(--brand-orange-soft)] text-[var(--brand-orange-strong)]",
  success:
    "border-emerald-500/30 bg-emerald-500/12 text-emerald-700",
  warning:
    "border-[var(--brand-orange-strong)]/40 bg-[var(--brand-orange-strong)]/18 text-[var(--brand-orange-strong)]",
  danger:
    "border-red-500/30 bg-red-500/12 text-red-700",
  info:
    "border-sky-200 bg-sky-50 text-sky-700",
  slate:
    "border-[var(--border)] bg-[var(--canvas)] text-[var(--ink-muted)]",
  amber:
    "border-amber-200 bg-amber-50 text-amber-800",
  green:
    "border-emerald-200 bg-emerald-50 text-emerald-700"
};

const BADGE_SIZES = {
  sm: "gap-1 px-2 py-0.5 text-[11px]",
  md: "gap-1.5 px-2.5 py-1 text-[12px]"
};

const STATUS_VARIANT_MAP = {
  enabled: "success",
  active: "success",
  "on target": "success",
  ontarget: "success",
  success: "success",
  pass: "success",
  passed: "success",

  paused: "warning",
  pending: "warning",
  "under utilized": "warning",
  underutilized: "warning",
  "under-utilized": "warning",
  warning: "warning",

  disabled: "neutral",
  inactive: "neutral",
  archived: "neutral",
  archive: "neutral",
  draft: "slate",

  failed: "danger",
  fail: "danger",
  error: "danger",
  "over budget": "danger",
  overbudget: "danger",
  "over utilized": "danger",
  overutilized: "danger",
  "over-utilized": "danger",
  danger: "danger"
};

function normalizeStatus(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(UNDERSCORE_OR_HYPHEN_REGEX, " ")
    .replace(WHITESPACE_COLLAPSE_REGEX, " ");
}

export function resolveBadgeVariant(status, fallback = "neutral") {
  const key = normalizeStatus(status);
  if (!key) return fallback;
  return STATUS_VARIANT_MAP[key] || STATUS_VARIANT_MAP[key.replace(WHITESPACE_COLLAPSE_REGEX, "")] || fallback;
}

export default function Badge({
  children,
  variant = "neutral",
  status,
  size = "md",
  className = "",
  as: Component = "span",
  ...props
}) {
  const resolvedVariant = status
    ? resolveBadgeVariant(status, variant)
    : variant in BADGE_VARIANTS
      ? variant
      : "neutral";

  return (
    <Component
      className={`inline-flex max-w-full items-center rounded-[7px] border font-semibold whitespace-nowrap ${BADGE_SIZES[size] || BADGE_SIZES.md} ${BADGE_VARIANTS[resolvedVariant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}

export { BADGE_VARIANTS, BADGE_SIZES };