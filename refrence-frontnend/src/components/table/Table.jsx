import { useEffect, useMemo, useRef, useState } from "react";
import { SortDownIcon, SortUpIcon } from '../ui/Icons';
import TableTruncate from "./TableTruncate";
import TablePager, {
  TableLimit,
  TableSelect,
  DEFAULT_TABLE_LIMIT,
  TABLE_LIMIT_OPTIONS
} from "./TablePager";
import TableSearch from "./TableSearch";
import { TableSkeleton } from "./TableState";

export {
  TablePager,
  TableLimit,
  TableSearch,
  TableSelect,
  DEFAULT_TABLE_LIMIT,
  TABLE_LIMIT_OPTIONS
};

export const TABLE_EMPTY_MESSAGE = "No data found";

export const TABLE_EMPTY_CELL_CLASS =
  "px-4 py-14 text-center text-[14px] font-medium text-[var(--ink-subtle)]";

const VIRTUALIZE_AFTER = 40;
const ROW_HEIGHT_PX = 52;
const OVERSCAN = 8;
const MAX_BODY_HEIGHT_PX = 560;

const CHECK_MARK_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='3.5 8.5 6.5 11.5 12.5 4.5'/%3E%3C/svg%3E\")";

const INDETERMINATE_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round'%3E%3Cline x1='3.5' y1='8' x2='12.5' y2='8'/%3E%3C/svg%3E\")";

const CHECKBOX_CLASS =
  "h-4 w-4 shrink-0 appearance-none rounded-[4px] border border-[var(--border-strong)] bg-[var(--surface)] checked:border-[var(--brand-orange)] checked:bg-[var(--brand-orange)] indeterminate:border-[var(--brand-orange)] indeterminate:bg-[var(--brand-orange)]";

function checkboxStyle({ checked = false, indeterminate = false } = {}) {
  return {
    backgroundImage: indeterminate
      ? INDETERMINATE_SVG
      : checked
        ? CHECK_MARK_SVG
        : "none",
    backgroundSize: "12px 12px",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  };
}

export function TableEmptyRow({
  colSpan,
  message = TABLE_EMPTY_MESSAGE,
  description = null,
  actionLabel = null,
  onAction = null
}) {
  return (
    <tr>
      <td colSpan={colSpan} className={TABLE_EMPTY_CELL_CLASS}>
        <div className="mx-auto flex max-w-md flex-col items-center gap-2">
          <p className="text-[14px] font-semibold text-[var(--ink-muted)]">{message}</p>
          {description ? (
            <p className="text-[13px] font-normal leading-relaxed text-[var(--ink-subtle)]">
              {description}
            </p>
          ) : null}
          {actionLabel && onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="mt-1 inline-flex h-[36px] items-center justify-center rounded-[7px] bg-[var(--brand-orange)] px-3.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

function SortArrows({ active, order }) {
  const upActive = active && String(order).toUpperCase() === "ASC";
  const downActive = active && String(order).toUpperCase() === "DESC";

  return (
    <span
      className="inline-flex shrink-0 flex-col items-center justify-center gap-[2px]"
      aria-hidden
    >
      <SortUpIcon className={upActive ? "text-[var(--brand-orange)]" : "text-[var(--ink-subtle)]"} />
      <SortDownIcon className={downActive ? "text-[var(--brand-orange)]" : "text-[var(--ink-subtle)]"} />
    </span>
  );
}

function getSortKey(column) {
  if (!column) return "";
  if (column.sortable === false) return "";
  const key = String(column.sortKey || column.key || "").trim();
  if (key === "asin") return "";
  return key;
}

function useVirtualRows(enabled, rowCount, scrollRef) {
  const [range, setRange] = useState(() => ({
    start: 0,
    end: Math.min(rowCount, VIRTUALIZE_AFTER + OVERSCAN)
  }));

  useEffect(() => {
    if (!enabled) {
      setRange({ start: 0, end: rowCount });
      return undefined;
    }

    const el = scrollRef.current;
    if (!el) return undefined;

    const update = () => {
      const scrollTop = el.scrollTop;
      const viewHeight = el.clientHeight || MAX_BODY_HEIGHT_PX;
      const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT_PX) - OVERSCAN);
      const visible = Math.ceil(viewHeight / ROW_HEIGHT_PX) + OVERSCAN * 2;
      const end = Math.min(rowCount, start + visible);
      setRange((prev) =>
        prev.start === start && prev.end === end ? prev : { start, end }
      );
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [enabled, rowCount, scrollRef]);

  return range;
}

function TableRow({
  row,
  index,
  columns,
  startIndex,
  selectable,
  selectionDisabled,
  selectionLocked,
  checked,
  onToggleRow,
  resolveRowId,
  virtualized
}) {
  const id = resolveRowId(row, index);
  const selectionBlocked = selectionDisabled || selectionLocked;

  return (
    <tr
      className="group border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--canvas)] transition-colors"
      style={
        virtualized
          ? {
              contentVisibility: "auto",
              containIntrinsicSize: `auto ${ROW_HEIGHT_PX}px`
            }
          : index >= 12
            ? {
                contentVisibility: "auto",
                containIntrinsicSize: `auto ${ROW_HEIGHT_PX}px`
              }
            : undefined
      }
    >
      <td className="px-2 py-3 text-[12px] font-medium tabular-nums text-[var(--ink-subtle)] whitespace-nowrap text-center sm:px-4 sm:py-3.5 sm:text-[14px]">
        {selectable ? (
          <input
            type="checkbox"
            checked={checked}
            disabled={selectionDisabled && !selectionLocked}
            readOnly={selectionLocked}
            onChange={() => {
              if (selectionBlocked) return;
              onToggleRow?.(id);
            }}
            className={`${CHECKBOX_CLASS} ${
              selectionBlocked
                ? "cursor-default pointer-events-none"
                : "cursor-pointer"
            } ${
              selectionDisabled && !selectionLocked
                ? "disabled:cursor-not-allowed disabled:opacity-50"
                : ""
            }`}
            style={checkboxStyle({ checked })}
            aria-label="Select row"
            aria-disabled={selectionBlocked || undefined}
          />
        ) : (
          startIndex + index
        )}
      </td>
      {columns.map((column) => {
        const raw = column.accessor ? column.accessor(row) : row?.[column.key];
        const content = column.render ? column.render(raw, row) : (raw ?? "—");
        const shouldTruncate = Boolean(column.truncate);
        const isNumeric = column.align === "right" || column.align === "center";

        return (
          <td
            key={column.key}
            className={`box-border px-2 py-3 text-[12px] font-normal text-[var(--ink)] overflow-hidden sm:px-4 sm:py-3.5 sm:text-[14px] ${
              shouldTruncate ? "" : "whitespace-nowrap"
            } ${isNumeric ? "text-center tabular-nums" : ""} ${
              column.className || ""
            }`}
            style={{
              width: column.width || undefined,
              minWidth: column.minWidth || column.width || undefined,
              maxWidth: column.maxWidth || undefined
            }}
          >
            {shouldTruncate ? (
              <TableTruncate value={raw ?? content} maxWidthClass="max-w-full" />
            ) : (
              content
            )}
          </td>
        );
      })}
    </tr>
  );
}

export default function Table({
  columns = [],
  rows = [],
  rowKey = "id",
  startIndex = 1,
  sortBy = "",
  sortOrder = "DESC",
  onSortChange,
  sortingDisabled = false,
  selectable = false,
  selectedKeys = [],
  getRowId,
  onToggleRow,
  onTogglePage,
  selectionDisabled = false,
  selectionLocked = false,
  emptyMessage,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  page,
  totalPages,
  totalRecords,
  pageSize,
  entityName = "records",
  onPageChange,
  paginationDisabled = false,
  constrainHeight = true,
  renderHeader,
  isLoading = false
}) {
  const scrollRef = useRef(null);
  const colCount = columns.length + 1;
  const activeSortBy = String(sortBy || "").trim();
  const activeSortOrder = String(sortOrder || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";
  const selectedSet = useMemo(
    () => new Set((selectedKeys || []).map((id) => String(id))),
    [selectedKeys]
  );
  const showPager =
    typeof onPageChange === "function" &&
    (Number(totalRecords) > 0 || Number(totalPages) > 1);
  const selectionBlocked = selectionDisabled || selectionLocked;

  const resolveRowId = (row, index) => {
    if (typeof getRowId === "function") return getRowId(row, index);
    const raw = row?.[rowKey];
    return raw == null ? `${index}` : raw;
  };

  const pageIds = rows.map((row, index) => resolveRowId(row, index));
  const allPageSelected =
    selectable && pageIds.length > 0 && pageIds.every((id) => selectedSet.has(String(id)));
  const somePageSelected =
    selectable && pageIds.some((id) => selectedSet.has(String(id))) && !allPageSelected;

  const virtualized = constrainHeight && rows.length > VIRTUALIZE_AFTER;
  const { start: virtualStart, end: virtualEnd } = useVirtualRows(
    virtualized,
    rows.length,
    scrollRef
  );

  const visibleRows = virtualized ? rows.slice(virtualStart, virtualEnd) : rows;
  const padTop = virtualized ? virtualStart * ROW_HEIGHT_PX : 0;
  const padBottom = virtualized
    ? Math.max(0, (rows.length - virtualEnd) * ROW_HEIGHT_PX)
    : 0;

  useEffect(() => {
    if (!virtualized) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = 0;
  }, [rows, virtualized]);

  return (
    <div className={showPager ? "min-w-0 max-w-full overflow-hidden rounded-b-[7px]" : "min-w-0 max-w-full"}>
    <div
      ref={scrollRef}
      className={
        virtualized
          ? "dashboard-main-scroll w-full min-w-0 max-w-full max-h-[560px] overflow-auto overscroll-y-contain overscroll-x-contain"
          : "dashboard-main-scroll w-full min-w-0 max-w-full overflow-x-auto overflow-y-visible overscroll-x-contain"
      }
    >
      <table className="w-max min-w-full border-separate border-spacing-0 text-left table-auto">
        <thead className={virtualized ? "sticky top-0 z-10" : undefined}>
          {typeof renderHeader === "function" ? (
            renderHeader({
              columns,
              selectable,
              allPageSelected,
              somePageSelected,
              selectionDisabled,
              selectionLocked,
              selectionBlocked,
              onTogglePage: () => onTogglePage?.(pageIds, !allPageSelected),
              activeSortBy,
              activeSortOrder,
              onSortChange,
              sortingDisabled
            })
          ) : (
            <tr className="border-b border-[var(--border)] bg-[var(--brand-orange-soft)]">
              <th className="box-border rounded-tl-[7px] px-2 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-muted)] whitespace-nowrap text-center w-[44px] sm:w-[56px] sm:px-4 sm:py-3.5 sm:text-[12px]">
              {selectable ? (
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  disabled={selectionDisabled && !selectionLocked}
                  readOnly={selectionLocked}
                  ref={(el) => {
                    if (el) el.indeterminate = somePageSelected;
                  }}
                  onChange={() => {
                    if (selectionBlocked) return;
                    onTogglePage?.(pageIds, !allPageSelected);
                  }}
                  className={`${CHECKBOX_CLASS} ${
                    selectionBlocked
                      ? "cursor-default pointer-events-none"
                      : "cursor-pointer"
                  } ${
                    selectionDisabled && !selectionLocked
                      ? "disabled:cursor-not-allowed disabled:opacity-50"
                      : ""
                  }`}
                  style={checkboxStyle({
                    checked: allPageSelected,
                    indeterminate: somePageSelected
                  })}
                  aria-label="Select all matching campaigns"
                  aria-disabled={selectionBlocked || undefined}
                />
              ) : (
                "#"
              )}
            </th>
            {columns.map((column, colIndex) => {
              const sortKey = getSortKey(column);
              const canSort = Boolean(sortKey) && typeof onSortChange === "function";
              const isActive = canSort && activeSortBy === sortKey;
              const isNumeric = column.align === "right" || column.align === "center";
              const isLastColumn = colIndex === columns.length - 1;

              const labelContent = (
                <span
                  className={`inline-flex max-w-full items-center gap-1.5 ${
                    isNumeric ? "justify-center" : "justify-start"
                  }`}
                >
                  <span className={`truncate ${isActive ? "text-[var(--ink)]" : ""}`}>
                    {column.label}
                  </span>
                  {canSort ? <SortArrows active={isActive} order={activeSortOrder} /> : null}
                </span>
              );

              return (
                <th
                  key={column.key}
                  className={`box-border px-2 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-muted)] whitespace-nowrap overflow-hidden sm:px-4 sm:py-3.5 sm:text-[12px] ${
                    isNumeric ? "text-center" : "text-left"
                  } ${isLastColumn ? "rounded-tr-[7px]" : ""}`}
                  style={{
                    width: column.width || undefined,
                    minWidth: column.minWidth || column.width || undefined,
                    maxWidth: column.maxWidth || undefined
                  }}
                  aria-sort={
                    isActive
                      ? activeSortOrder === "ASC"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  {canSort ? (
                    <button
                      type="button"
                      disabled={sortingDisabled}
                      onClick={() => onSortChange?.(sortKey)}
                      className="inline-flex max-w-full items-center rounded-[4px] text-inherit transition-colors hover:text-[var(--ink)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                      title={
                        isActive
                          ? `Sorted ${activeSortOrder === "ASC" ? "ascending" : "descending"} — click to toggle`
                          : "Click to sort"
                      }
                    >
                      {labelContent}
                    </button>
                  ) : (
                    labelContent
                  )}
                </th>
              );
            })}
          </tr>
          )}
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={colCount} className="p-0 border-b-0">
                <TableSkeleton rows={7} className="py-8" showToolbarPulse={false} />
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <TableEmptyRow
              colSpan={colCount}
              message={emptyMessage}
              description={emptyDescription}
              actionLabel={emptyActionLabel}
              onAction={onEmptyAction}
            />
          ) : (
            <>
              {padTop > 0 ? (
                <tr aria-hidden>
                  <td colSpan={colCount} style={{ height: padTop, padding: 0, border: 0 }} />
                </tr>
              ) : null}
              {visibleRows.map((row, offset) => {
                const index = virtualized ? virtualStart + offset : offset;
                const id = resolveRowId(row, index);
                return (
                  <TableRow
                    key={String(id)}
                    row={row}
                    index={index}
                    columns={columns}
                    startIndex={startIndex}
                    selectable={selectable}
                    selectionDisabled={selectionDisabled}
                    selectionLocked={selectionLocked}
                    checked={selectedSet.has(String(id))}
                    onToggleRow={onToggleRow}
                    resolveRowId={resolveRowId}
                    virtualized={virtualized}
                  />
                );
              })}
              {padBottom > 0 ? (
                <tr aria-hidden>
                  <td colSpan={colCount} style={{ height: padBottom, padding: 0, border: 0 }} />
                </tr>
              ) : null}
            </>
          )}
        </tbody>
      </table>
    </div>
    {showPager ? (
      <TablePager
        page={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        pageSize={pageSize}
        entityName={entityName}
        disabled={paginationDisabled}
        onPageChange={onPageChange}
      />
    ) : null}
    </div>
  );
}