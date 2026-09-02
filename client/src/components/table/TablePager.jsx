/**
 * components/table/TablePager.jsx
 * Pagination footer for table panels — page numbers + prev/next.
 */

import { IconChevronLeft, IconChevronRight } from "../ui/Icons";
import Select from "../ui/Select";

export const TABLE_LIMIT_OPTIONS = [10, 15, 20, 25, 50];
export const DEFAULT_TABLE_LIMIT = 10;

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
  disabled = false,
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
    "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-textPrimary transition hover:bg-surfaceLight disabled:cursor-not-allowed disabled:opacity-40 sm:h-[38px] sm:w-[38px]";

  return (
    <div className="flex flex-col items-center gap-3 border-t border-border/60 px-3 py-3 text-center sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5 sm:text-left">
      <p className="text-xs leading-snug text-textSecondary sm:text-sm">{label}</p>

      {safeTotalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => onPageChange?.(safePage - 1)}
            className={arrowBtn}
            aria-label="Previous page"
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>

          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`e-${index}`}
                className="select-none px-1 text-sm text-textSecondary/50 sm:px-1.5"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                disabled={disabled}
                onClick={() => onPageChange?.(item)}
                className={`h-10 min-w-10 cursor-pointer rounded-lg px-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-[38px] sm:min-w-[38px] sm:px-2.5 ${
                  item === safePage
                    ? "bg-accentGreen text-white"
                    : "border border-border bg-white text-textPrimary hover:border-accentGreen/40 hover:bg-successBg hover:text-primaryDark"
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
            <IconChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function TableLimit({ value = DEFAULT_TABLE_LIMIT, onChange, options = TABLE_LIMIT_OPTIONS }) {
  const menuOptions = options.map((option) => ({
    value: String(option),
    label: String(option),
  }));

  return (
    <Select
      id="table-limit"
      value={String(value)}
      onChange={(event) => onChange?.(Number(event.target.value))}
      options={menuOptions}
      size="sm"
      autoWidth
      menuAlign="right"
      menuMinWidth={72}
      ariaLabel="Rows per page"
      className="table-toolbar__limit shrink-0"
    />
  );
}
