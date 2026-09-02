import { ChevronLeftIcon, ChevronRightIcon } from '../ui/Icons';
import Select from "../ui/Select";

export const TABLE_LIMIT_OPTIONS = [10, 15, 20, 25, 50, 100];
export const DEFAULT_TABLE_LIMIT = 15;

function buildPageItems(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }

  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const items = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      items.push("ellipsis");
    }
    items.push(sorted[i]);
  }
  return items;
}

export default function TablePager({
  page = 1,
  totalPages = 1,
  totalRecords = 0,
  pageSize = 10,
  entityName = "records",
  onPageChange,
  disabled = false
}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeTotalPages = Math.max(1, Number(totalPages) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || 10);
  const from = totalRecords === 0 ? 0 : (safePage - 1) * safePageSize + 1;
  const to = Math.min(safePage * safePageSize, totalRecords);
  const pageItems = buildPageItems(safePage, safeTotalPages);
  const canPrev = safePage > 1 && !disabled;
  const canNext = safePage < safeTotalPages && !disabled;

  if (totalRecords <= 0 && safeTotalPages <= 1) {
    return null;
  }

  const label = `Showing ${from} to ${to} of ${totalRecords.toLocaleString()} ${entityName}`;
  const arrowBtn =
    "inline-flex h-10 w-10 sm:h-[38px] sm:w-[38px] items-center justify-center rounded-[7px] border border-[var(--ink)]/15 bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--ink)]/[0.03] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-col items-center gap-3 border-t border-[var(--ink)]/[0.06] px-3 py-3 text-center sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5 sm:text-left">
      <p className="text-[12px] leading-snug text-[var(--ink)]/55 sm:text-[14px]">{label}</p>

      {safeTotalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => onPageChange?.(safePage - 1)}
            className={arrowBtn}
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="h-[15px] w-[15px]" strokeWidth={2.5} />
          </button>

          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`e-${index}`}
                className="px-1 sm:px-1.5 text-[14px] text-[var(--ink)]/35 select-none"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                disabled={disabled}
                onClick={() => onPageChange?.(item)}
                className={`min-w-10 h-10 sm:min-w-[38px] sm:h-[38px] rounded-[7px] px-2 sm:px-2.5 text-[13px] sm:text-[14px] font-bold cursor-pointer transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${item === safePage
                    ? "bg-[var(--brand-orange)] text-white"
                    : "border border-[var(--ink)]/15 bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--brand-orange)]/40 hover:bg-[var(--brand-orange-soft)] hover:text-[var(--brand-orange-strong)]"
                  }`}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            disabled={!canNext}
            onClick={() => onPageChange?.(safePage + 1)}
            className={arrowBtn}
            aria-label="Next page"
          >
            <ChevronRightIcon className="h-[15px] w-[15px]" strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}

export function TableLimit({ value = 15, onChange, options = TABLE_LIMIT_OPTIONS }) {
  const menuOptions = options.map((option) => ({
    value: Number(option),
    label: String(option)
  }));

  return (
    <Select
      value={Number(value)}
      onChange={(next) => onChange?.(Number(next))}
      options={menuOptions}
      autoWidth
      menuAlign="right"
      menuMinWidth={72}
      ariaLabel="Rows per page"
      className="table-toolbar__limit shrink-0"
      triggerClassName="h-[42px] min-w-[72px] py-2.5 pl-3 pr-2.5 text-[14px] font-bold text-[var(--ink)]"
    />
  );
}

export function TableSelect({
  value,
  onChange,
  options = [],
  ariaLabel = "Filter",
  className = ""
}) {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      autoWidth={false}
      menuAlign="left"
      menuMinWidth={148}
      ariaLabel={ariaLabel}
      className={`w-auto min-w-[148px] max-w-[220px] shrink-0 ${className}`}
      triggerClassName="h-[42px] py-2.5 pl-3.5 pr-3 text-[14px] font-semibold text-[var(--ink)]"
    />
  );
}