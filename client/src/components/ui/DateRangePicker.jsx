import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { IconCalendarDays, IconChevronDown, IconChevronLeft, IconChevronRight, IconXMark } from "./Icons";
import {
  DATE_OPERATOR_OPTIONS,
  addMonths,
  clampToMaxDay,
  clampToMaxMonth,
  detectPresetId,
  endOfMonth,
  formatDateFilterLabel,
  formatDisplayDate,
  formatIsoDate,
  getMonthMatrix,
  getMonthOptions,
  getPresetsForOperator,
  isAfterDay,
  isBeforeDay,
  isSameDay,
  isWithinInclusive,
  resolvePresetRange,
  startOfMonth,
  toDateOnly,
} from "../../utils/dateRange";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PANEL_GAP = 10;
const VIEWPORT_PAD = 12;
const YEAR_GRID_SIZE = 12;
/** Keeps day / month / year views the same size so the panel does not jump. */
const CALENDAR_BODY_CLASS = "h-[248px] sm:h-[268px]";
const DUAL_CALENDAR_MIN_WIDTH = 768;

function startOfYearGrid(year) {
  return Math.floor(Number(year) / YEAR_GRID_SIZE) * YEAR_GRID_SIZE;
}

/** Between + dual calendars: left = previous month, right = current (max) month. */
function getMaxLeftMonth(maxDate, { betweenDual = false } = {}) {
  const current = startOfMonth(maxDate);
  if (!current) return null;
  return betweenDual ? addMonths(current, -1) : current;
}

function resolveViewLeftMonth({
  start,
  end,
  maxDate,
  betweenDual = false
}) {
  const current = startOfMonth(maxDate);
  if (!current) return null;
  const maxLeft = getMaxLeftMonth(maxDate, { betweenDual });
  const anchor = startOfMonth(end || start);
  if (!anchor) {
    return maxLeft || current;
  }
  if (betweenDual) {
    // Keep selection visible on the right calendar when possible.
    const rightTarget = clampToMaxMonth(anchor, maxDate) || current;
    return (
      clampToMaxMonth(addMonths(rightTarget, -1), maxLeft) || maxLeft || current
    );
  }
  return clampToMaxMonth(anchor, maxDate) || current;
}

function HeaderSelectButton({
  label,
  open,
  onClick,
  ariaLabel,
  className = "",
  triggerClassName = "h-8 px-2.5 text-[12px] sm:text-[13px]"
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-expanded={open}
      onClick={onClick}
      className={`inline-flex min-w-0 items-center justify-between gap-1.5 rounded-[7px] border bg-[var(--drp-surface)] text-left font-semibold text-[var(--drp-ink)] outline-none transition-[border-color,box-shadow] ${
        open
          ? "border-[var(--drp-accent)] shadow-[0_0_0_3px_rgba(34,197,94,0.15)]"
          : "border-[var(--drp-border)] hover:border-[var(--drp-border-strong)]"
      } ${triggerClassName} ${className}`}
    >
      <span className="min-w-0 truncate">{label}</span>
      <IconChevronDown
        className={`h-3.5 w-3.5 shrink-0 text-[var(--drp-ink-subtle)] transition-transform ${
          open ? "rotate-180" : ""
        }`}
        aria-hidden
      />
    </button>
  );
}

/** Absolute menu under trigger — for Filter type (short list, stays in panel). */
function AsideFieldSelect({
  value,
  onChange,
  options = [],
  ariaLabel,
  className = "",
  triggerClassName = "h-9 px-2.5 text-[13px]"
}) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const selected =
    options.find((option) => String(option.value) === String(value)) || null;

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <HeaderSelectButton
        label={selected?.label ?? (value != null ? String(value) : "Select")}
        open={open}
        onClick={() => setOpen((prev) => !prev)}
        ariaLabel={ariaLabel}
        className="w-full"
        triggerClassName={triggerClassName}
      />
      {open ? (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-52 overflow-y-auto overscroll-contain rounded-[7px] border border-[var(--drp-border)] bg-[var(--drp-surface)] py-1 shadow-[0_12px_28px_rgba(17,24,39,0.16)]"
        >
          {options.map((option) => {
            const active = String(option.value) === String(value);
            return (
              <button
                key={String(option.value)}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange?.(option.value, option);
                  setOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center px-3 py-2 text-left text-[13px] transition-colors ${
                  active
                    ? "bg-[var(--drp-accent)] font-semibold text-white"
                    : "font-medium text-[var(--drp-ink)] hover:bg-[var(--drp-accent-soft)] hover:text-[var(--drp-accent-strong)]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function DayCell({
  day,
  monthValue,
  selectedStart,
  selectedEnd,
  previewStart,
  previewEnd,
  today,
  maxDate,
  rangeMode = "between",
  onSelect,
  onDayHover,
  onDayPressStart,
  onDayPressEnd
}) {
  const inCurrentMonth = day.getMonth() === monthValue.getMonth();
  const isToday = isSameDay(day, today);
  const disabled = Boolean(maxDate && isAfterDay(day, maxDate));
  const previewRangeActive = Boolean(previewStart && previewEnd);

  let inSelected = false;
  let isSelectedStart = false;
  let isSelectedEnd = false;

  if (rangeMode === "on") {
    inSelected = Boolean(selectedStart && isSameDay(day, selectedStart));
    isSelectedStart = inSelected;
    isSelectedEnd = inSelected;
  } else if (rangeMode === "before" && selectedStart) {
    inSelected =
      isSameDay(day, selectedStart) || isBeforeDay(day, selectedStart);
    isSelectedEnd = isSameDay(day, selectedStart);
    isSelectedStart = false;
  } else if (rangeMode === "after" && selectedStart) {
    inSelected =
      isSameDay(day, selectedStart) || isAfterDay(day, selectedStart);
    isSelectedStart = isSameDay(day, selectedStart);
    isSelectedEnd = false;
  } else if (selectedStart && selectedEnd) {
    inSelected = isWithinInclusive(day, selectedStart, selectedEnd);
    isSelectedStart = isSameDay(day, selectedStart);
    isSelectedEnd = isSameDay(day, selectedEnd);
  } else if (selectedStart && !selectedEnd) {
    inSelected = isSameDay(day, selectedStart);
    isSelectedStart = inSelected;
    isSelectedEnd = inSelected;
  }

  const inPreview =
    previewRangeActive && isWithinInclusive(day, previewStart, previewEnd);
  const isPreviewStart = previewStart && isSameDay(day, previewStart);
  const isPreviewEnd = previewEnd && isSameDay(day, previewEnd);

  const showPreview = Boolean(!disabled && previewRangeActive && inPreview);
  const showSolid = Boolean(!disabled && inSelected && !showPreview);
  const showDimSelected = Boolean(showPreview && inSelected && !inPreview);
  const isEdge =
    (showSolid && (isSelectedStart || isSelectedEnd)) ||
    (showPreview && (isPreviewStart || isPreviewEnd));
  const inFill = (showSolid && inSelected) || (showPreview && inPreview);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onSelect?.(day);
      }}
      onMouseEnter={() => {
        if (disabled) return;
        onDayHover?.(day);
      }}
      onPointerDown={(event) => {
        if (disabled) return;
        if (event.pointerType !== "mouse") return;
        event.preventDefault();
        onDayPressStart?.(day);
      }}
      onPointerUp={(event) => {
        if (disabled) return;
        if (event.pointerType !== "mouse") return;
        onDayPressEnd?.(day);
      }}
      className={`relative flex h-full min-h-0 w-full touch-manipulation items-center justify-center text-[12px] sm:text-[13px] transition-colors select-none ${
        disabled
          ? "cursor-not-allowed text-[var(--drp-ink-subtle)]/45"
          : inCurrentMonth
            ? "cursor-pointer text-[var(--drp-ink)]"
            : "cursor-pointer text-[var(--drp-ink-subtle)]"
      }`}
    >
      {showDimSelected ? (
        <span className="pointer-events-none absolute inset-y-1 left-0 right-0 bg-[var(--drp-accent)]/15" />
      ) : null}

      {showPreview ? (
        <span
          className={`pointer-events-none absolute inset-y-1 left-0 right-0 ${isPreviewStart && isPreviewEnd
              ? "rounded-full bg-[var(--drp-accent)]"
              : isPreviewStart
                ? "rounded-l-full bg-[var(--drp-accent)]"
                : isPreviewEnd
                  ? "rounded-r-full bg-[var(--drp-accent)]"
                  : "bg-[var(--drp-accent)]/70"
            }`}
        />
      ) : null}

      {showSolid ? (
        <span
          className={`pointer-events-none absolute inset-y-1 left-0 right-0 ${isSelectedStart && isSelectedEnd
              ? "rounded-full bg-[var(--drp-accent)]"
              : rangeMode === "before" && isSelectedEnd
                ? "rounded-r-full bg-[var(--drp-accent)]"
                : rangeMode === "after" && isSelectedStart
                  ? "rounded-l-full bg-[var(--drp-accent)]"
                  : rangeMode === "before"
                    ? "bg-[var(--drp-accent)]/55"
                    : rangeMode === "after"
                      ? "bg-[var(--drp-accent)]/55"
                      : isSelectedStart
                        ? "rounded-l-full bg-[var(--drp-accent)]"
                        : isSelectedEnd
                          ? "rounded-r-full bg-[var(--drp-accent)]"
                          : "bg-[var(--drp-accent)]/85"
            }`}
        />
      ) : null}

      <span
        className={`pointer-events-none relative z-[1] inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full ${inFill
            ? isEdge
              ? "font-semibold text-white"
              : "font-medium text-white"
            : ""
          } ${isToday && !inFill ? "underline decoration-[var(--drp-accent)] decoration-2 underline-offset-4" : ""}`}
      >
        {day.getDate()}
      </span>
    </button>
  );
}

function MonthCalendar({
  monthValue,
  selectedStart,
  selectedEnd,
  previewStart,
  previewEnd,
  today,
  maxDate,
  rangeMode = "between",
  onSelectDay,
  onDayHover,
  onDayPressStart,
  onDayPressEnd,
  onMonthChange
}) {
  const weeks = useMemo(() => getMonthMatrix(monthValue), [monthValue]);
  const monthOptions = getMonthOptions();
  const [openPicker, setOpenPicker] = useState(null);
  const [yearStart, setYearStart] = useState(() =>
    startOfYearGrid(monthValue.getFullYear())
  );
  const yearOptions = useMemo(
    () => Array.from({ length: YEAR_GRID_SIZE }, (_, index) => yearStart + index),
    [yearStart]
  );
  const maxDay = toDateOnly(maxDate) || toDateOnly(today);
  const maxYear = maxDay ? maxDay.getFullYear() : null;
  const maxMonthIndex = maxDay ? maxDay.getMonth() : null;
  const canGoNextYearPage =
    maxYear == null || yearStart + YEAR_GRID_SIZE <= maxYear;

  const monthLabel =
    monthOptions.find(
      (option) => Number(option.value) === monthValue.getMonth()
    )?.label ?? monthValue.toLocaleString("en", { month: "long" });

  const changeMonth = (next) => {
    onMonthChange?.(clampToMaxMonth(next, maxDay) || startOfMonth(next));
  };

  const toggleYearPicker = () => {
    if (openPicker === "year") {
      setOpenPicker(null);
      return;
    }
    setYearStart(startOfYearGrid(monthValue.getFullYear()));
    setOpenPicker("year");
  };

  const isMonthDisabled = (monthIndex) => {
    if (maxYear == null || maxMonthIndex == null) return false;
    const year = monthValue.getFullYear();
    if (year > maxYear) return true;
    if (year < maxYear) return false;
    return monthIndex > maxMonthIndex;
  };

  const isYearDisabled = (year) =>
    maxYear != null && Number(year) > maxYear;

  const pickerCellClass = (active, disabled = false) =>
    `flex h-full min-h-0 w-full items-center justify-center rounded-[7px] text-[13px] font-semibold transition-colors ${
      disabled
        ? "cursor-not-allowed text-[var(--drp-ink-subtle)]/40"
        : active
          ? "cursor-pointer bg-[var(--drp-accent)] text-white"
          : "cursor-pointer text-[var(--drp-ink)] hover:bg-[var(--drp-accent-soft)] hover:text-[var(--drp-accent-strong)]"
    }`;

  return (
    <div className="relative min-w-0 w-full">
      <div className="mb-2 flex w-full min-w-0 items-center gap-1.5 sm:mb-3">
        <HeaderSelectButton
          label={monthLabel}
          open={openPicker === "month"}
          onClick={() =>
            setOpenPicker((prev) => (prev === "month" ? null : "month"))
          }
          ariaLabel="Month"
          className="min-w-0 flex-1 basis-0"
        />
        <HeaderSelectButton
          label={String(monthValue.getFullYear())}
          open={openPicker === "year"}
          onClick={toggleYearPicker}
          ariaLabel="Year"
          className="w-[5.75rem] shrink-0 grow-0"
          triggerClassName="h-8 px-2 text-[12px] sm:text-[13px]"
        />
      </div>

      <div className={`${CALENDAR_BODY_CLASS} min-w-0`}>
        {openPicker === "month" ? (
          <div
            role="listbox"
            aria-label="Select month"
            className="grid h-full grid-cols-3 grid-rows-4 gap-1.5"
          >
            {monthOptions.map((option) => {
              const monthIndex = Number(option.value);
              const active = monthIndex === monthValue.getMonth();
              const disabled = isMonthDisabled(monthIndex);
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    changeMonth(
                      new Date(monthValue.getFullYear(), monthIndex, 1)
                    );
                    setOpenPicker(null);
                  }}
                  className={pickerCellClass(active, disabled)}
                >
                  {option.label.slice(0, 3)}
                </button>
              );
            })}
          </div>
        ) : openPicker === "year" ? (
          <div className="flex h-full min-h-0 flex-col">
            <div className="mb-1 flex shrink-0 items-center justify-between gap-2 px-0.5">
              <button
                type="button"
                onClick={() => setYearStart((prev) => prev - YEAR_GRID_SIZE)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] text-[var(--drp-ink-muted)] transition-colors hover:bg-[var(--drp-accent-soft)] hover:text-[var(--drp-accent-strong)] cursor-pointer"
                aria-label="Previous years"
              >
                <IconChevronLeft className="h-4 w-4" />
              </button>
              <p className="text-[12px] font-semibold text-[var(--drp-ink-muted)]">
                {yearStart} – {yearStart + YEAR_GRID_SIZE - 1}
              </p>
              <button
                type="button"
                disabled={!canGoNextYearPage}
                onClick={() => {
                  if (!canGoNextYearPage) return;
                  setYearStart((prev) => prev + YEAR_GRID_SIZE);
                }}
                className={`inline-flex h-7 w-7 items-center justify-center rounded-[6px] transition-colors ${
                  canGoNextYearPage
                    ? "cursor-pointer text-[var(--drp-ink-muted)] hover:bg-[var(--drp-accent-soft)] hover:text-[var(--drp-accent-strong)]"
                    : "cursor-not-allowed text-[var(--drp-ink-subtle)]/40"
                }`}
                aria-label="Next years"
              >
                <IconChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div
              role="listbox"
              aria-label="Select year"
              className="grid min-h-0 flex-1 grid-cols-3 grid-rows-4 gap-1.5"
            >
              {yearOptions.map((year) => {
                const active = year === monthValue.getFullYear();
                const disabled = isYearDisabled(year);
                return (
                  <button
                    key={year}
                    type="button"
                    role="option"
                    aria-selected={active}
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return;
                      const nextMonth =
                        maxYear != null &&
                        year === maxYear &&
                        monthValue.getMonth() > maxMonthIndex
                          ? maxMonthIndex
                          : monthValue.getMonth();
                      changeMonth(new Date(year, nextMonth, 1));
                      setOpenPicker(null);
                    }}
                    className={pickerCellClass(active, disabled)}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col">
            <div className="mb-1 grid shrink-0 grid-cols-7 gap-0">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="py-1 text-center text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--drp-ink-subtle)]"
                >
                  {day.slice(0, 2)}
                </div>
              ))}
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-y-0.5">
              {weeks.flat().map((day) => (
                <DayCell
                  key={formatIsoDate(day)}
                  day={day}
                  monthValue={monthValue}
                  selectedStart={selectedStart}
                  selectedEnd={selectedEnd}
                  previewStart={previewStart}
                  previewEnd={previewEnd}
                  today={today}
                  maxDate={maxDay}
                  rangeMode={rangeMode}
                  onSelect={onSelectDay}
                  onDayHover={onDayHover}
                  onDayPressStart={onDayPressStart}
                  onDayPressEnd={onDayPressEnd}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getFloatingBounds(triggerEl) {
  const pad = VIEWPORT_PAD;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = pad;
  let top = pad;
  let right = vw - pad;
  let bottom = vh - pad;

  const main = triggerEl?.closest("main");
  if (main) {
    const rect = main.getBoundingClientRect();
    left = Math.max(left, rect.left + pad);
    right = Math.min(right, rect.right - pad);
    top = Math.max(top, rect.top + pad);
    bottom = Math.min(bottom, rect.bottom - pad);
  } else {
    const header = document.querySelector("header");
    const headerRect = header?.getBoundingClientRect();
    if (headerRect) {
      top = Math.max(top, headerRect.bottom + pad);
    }

    const aside = document.querySelector("aside");
    const asideRect = aside?.getBoundingClientRect();
    if (asideRect && asideRect.width > 0 && asideRect.left >= 0) {
      left = Math.max(left, asideRect.right + pad);
    }
  }

  if (right - left < 240) {
    left = pad;
    right = vw - pad;
  }

  return { left, top, right, bottom };
}

function computePanelStyle(triggerEl, panelEl, { isBetween = false } = {}) {
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const isMobile = viewportW < 640;
  const isMd = viewportW >= 768;
  const isLg = viewportW >= 1024;
  const bounds = getFloatingBounds(triggerEl);
  const boundsWidth = Math.max(280, bounds.right - bounds.left);
  const boundsHeight = Math.max(240, bounds.bottom - bounds.top);

  const maxAvailable = boundsWidth;

  let preferredWidth;
  if (isMobile) {
    preferredWidth = maxAvailable;
  } else if (isBetween) {
    if (isLg) preferredWidth = Math.min(860, maxAvailable);
    else if (isMd) preferredWidth = Math.min(760, maxAvailable);
    else preferredWidth = Math.min(560, maxAvailable);
  } else {
    preferredWidth = Math.min(isMd ? 520 : 480, maxAvailable);
  }

  if (!triggerEl) {
    if (isMobile) {
      return {
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        top: "auto",
        width: "100%",
        maxWidth: "100%",
        maxHeight: Math.min(viewportH * 0.92, isBetween ? 640 : 560),
        borderRadius: "16px 16px 0 0"
      };
    }
    return {
      position: "fixed",
      top: bounds.top,
      left: bounds.left,
      width: Math.min(preferredWidth, boundsWidth),
      maxWidth: boundsWidth,
      maxHeight: boundsHeight
    };
  }

  const trigger = triggerEl.getBoundingClientRect();

  let left;
  if (isMobile) {
    left = bounds.left;
  } else {
    left = trigger.right - preferredWidth;
    left = Math.max(
      bounds.left,
      Math.min(left, bounds.right - preferredWidth)
    );

    if (left + preferredWidth > bounds.right) {
      left = Math.max(bounds.left, trigger.left);
    }

    if (left + preferredWidth > bounds.right) {
      preferredWidth = Math.max(280, bounds.right - left);
    }
  }

  const panelHeight =
    panelEl?.offsetHeight || Math.min(isBetween ? 560 : 480, boundsHeight);
  const spaceBelow = bounds.bottom - trigger.bottom - PANEL_GAP;
  const spaceAbove = trigger.top - bounds.top - PANEL_GAP;
  let top;
  let maxHeight;
  let bottom;
  let borderRadius;
  if (isMobile) {
    left = 0;
    preferredWidth = viewportW;
    top = "auto";
    bottom = 0;
    maxHeight = Math.min(viewportH * 0.92, isBetween ? 640 : 560);
    borderRadius = "16px 16px 0 0";
  } else {
    top = trigger.bottom + PANEL_GAP;

    if (top + panelHeight > bounds.bottom) {
      const aboveTop = trigger.top - PANEL_GAP - panelHeight;
      if (aboveTop >= bounds.top && spaceAbove >= spaceBelow) {
        top = aboveTop;
      } else {
        top = Math.max(bounds.top, bounds.bottom - panelHeight);
      }
    }

    top = Math.max(bounds.top, top);
    maxHeight = Math.max(240, bounds.bottom - top);
  }

  return {
    position: "fixed",
    top: top ?? undefined,
    bottom: bottom ?? undefined,
    left,
    width: preferredWidth,
    maxWidth: isMobile ? "100%" : boundsWidth,
    maxHeight,
    borderRadius: borderRadius || undefined
  };
}

function normalizeOperatorList(operators) {
  if (Array.isArray(operators) && operators.length) {
    const list = operators
      .map((item) => {
        if (typeof item === "string") {
          const value = item.trim().toLowerCase();
          return value ? { value, label: value.charAt(0).toUpperCase() + value.slice(1) } : null;
        }
        const value = String(item?.value || item?.operator || "").trim().toLowerCase();
        if (!value) return null;
        return {
          value,
          label: String(item?.label || value).replace(/_/g, " ")
        };
      })
      .filter(Boolean);
    if (list.length) return list;
  }
  return DATE_OPERATOR_OPTIONS;
}

export default function DateRangePicker({
  startDate = null,
  endDate = null,
  operator: appliedOperator = null,
  preset: appliedPreset = null,
  operators = null,
  onboardedAt = null,
  onApply,
  onClear,
  className = "",
  showApplyToast = false,
  hideOperatorSelect = false,
  preferDateRangeLabel = false
}) {
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [today, setToday] = useState(() => toDateOnly(new Date()));
  const maxDate = today;
  const operatorOptions = useMemo(() => normalizeOperatorList(operators), [operators]);

  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState(null);
  const [isMobileSheet, setIsMobileSheet] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 640
  );
  const [isDualCalendar, setIsDualCalendar] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= DUAL_CALENDAR_MIN_WIDTH
  );
  const [draftOperator, setDraftOperator] = useState(
    () => appliedOperator || operatorOptions[0]?.value || "between"
  );
  const [draftStart, setDraftStart] = useState(() => toDateOnly(startDate));
  const [draftEnd, setDraftEnd] = useState(() => toDateOnly(endDate));
  const [activePreset, setActivePreset] = useState(() => appliedPreset || null);
  const [hoverPreset, setHoverPreset] = useState(null);
  const [hoverDay, setHoverDay] = useState(null);
  const [pickingEnd, setPickingEnd] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const ignoreClickRef = useRef(false);
  const isDraggingRef = useRef(false);
  const [leftMonth, setLeftMonthState] = useState(() => {
    const now = toDateOnly(new Date());
    const dual =
      typeof window !== "undefined" && window.innerWidth >= DUAL_CALENDAR_MIN_WIDTH;
    const op = appliedOperator || "between";
    return resolveViewLeftMonth({
      start: toDateOnly(startDate),
      end: toDateOnly(endDate),
      maxDate: now,
      betweenDual: op === "between" && dual
    });
  });

  const betweenDual = draftOperator === "between" && isDualCalendar;
  const maxLeftMonth = useMemo(
    () => getMaxLeftMonth(maxDate, { betweenDual }),
    [maxDate, betweenDual]
  );

  const setLeftMonth = (next) => {
    setLeftMonthState((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      return (
        clampToMaxMonth(resolved, maxLeftMonth) ||
        startOfMonth(resolved) ||
        maxLeftMonth
      );
    });
  };

  const rightMonth = useMemo(() => addMonths(leftMonth, 1), [leftMonth]);
  const canGoNextMonth = Boolean(
    maxLeftMonth && !isAfterDay(addMonths(leftMonth, 1), maxLeftMonth)
  );
  const rangeMode =
    draftOperator === "on" ||
      draftOperator === "before" ||
      draftOperator === "after"
      ? draftOperator
      : "between";

  const presets = useMemo(
    () => getPresetsForOperator(draftOperator),
    [draftOperator]
  );

  const appliedLabel = formatDateFilterLabel({
    operator: appliedOperator || draftOperator,
    startDate,
    endDate,
    preset: appliedPreset,
    preferDateRangeLabel
  });

  const dragPreviewRange = useMemo(() => {
    if (draftOperator !== "between") return null;
    if (!draftStart || draftEnd) return null;
    if (!pickingEnd && !isDragging) return null;
    if (!hoverDay) return null;
    if (isBeforeDay(hoverDay, draftStart)) {
      return { start: hoverDay, end: draftStart };
    }
    return { start: draftStart, end: hoverDay };
  }, [draftOperator, draftStart, draftEnd, pickingEnd, isDragging, hoverDay]);

  const previewRange = useMemo(() => {
    if (dragPreviewRange) return dragPreviewRange;
    if (!hoverPreset) return null;
    if (draftOperator !== "between" && draftOperator !== "on") return null;
    return resolvePresetRange(hoverPreset, { today, onboardedAt });
  }, [dragPreviewRange, hoverPreset, draftOperator, today, onboardedAt]);

  useEffect(() => {
    const refreshToday = () => {
      const next = toDateOnly(new Date());
      setToday((prev) => (prev && next && isSameDay(prev, next) ? prev : next));
    };
    refreshToday();
    const id = window.setInterval(refreshToday, 60_000);
    window.addEventListener("focus", refreshToday);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", refreshToday);
    };
  }, []);

  useEffect(() => {
    setLeftMonthState((prev) => clampToMaxMonth(prev, maxLeftMonth) || prev);
  }, [maxLeftMonth]);

  const updatePanelPosition = () => {
    const mobile = window.innerWidth < 640;
    const dual = window.innerWidth >= DUAL_CALENDAR_MIN_WIDTH;
    setIsMobileSheet(mobile);
    setIsDualCalendar(dual);
    
    const style = computePanelStyle(triggerRef.current, panelRef.current, {
      isBetween: draftOperator === "between"
    });
    
    if (panelRef.current) {
      const el = panelRef.current;
      el.style.position = style.position || "";
      el.style.top = style.top !== undefined ? (typeof style.top === "number" ? `${style.top}px` : style.top) : "";
      el.style.bottom = style.bottom !== undefined ? (typeof style.bottom === "number" ? `${style.bottom}px` : style.bottom) : "";
      el.style.left = style.left !== undefined ? (typeof style.left === "number" ? `${style.left}px` : style.left) : "";
      el.style.width = style.width !== undefined ? (typeof style.width === "number" ? `${style.width}px` : style.width) : "";
      el.style.maxWidth = style.maxWidth !== undefined ? (typeof style.maxWidth === "number" ? `${style.maxWidth}px` : style.maxWidth) : "";
      el.style.maxHeight = style.maxHeight !== undefined ? (typeof style.maxHeight === "number" ? `${style.maxHeight}px` : style.maxHeight) : "";
      el.style.borderRadius = style.borderRadius || "";
    } else {
      setPanelStyle(style);
    }
  };

  useLayoutEffect(() => {
    if (!open) return undefined;
    updatePanelPosition();
    const frame = window.requestAnimationFrame(updatePanelPosition);
    return () => window.cancelAnimationFrame(frame);
  }, [open, draftStart, draftEnd, leftMonth, draftOperator, activePreset]);

  useEffect(() => {
    if (!open) return undefined;

    const onOutside = (event) => {
      const inTrigger = rootRef.current?.contains(event.target);
      const inPanel = panelRef.current?.contains(event.target);
      if (!inTrigger && !inPanel) {
        setOpen(false);
      }
    };
    const onEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onReposition = () => updatePanelPosition();

    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onEscape);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEscape);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, draftOperator]);

  const stopDragging = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const syncFromProps = () => {
    const nextOperator =
      appliedOperator || operatorOptions[0]?.value || "between";
    const nextStart = toDateOnly(startDate);
    const nextEnd = toDateOnly(endDate);
    setDraftOperator(nextOperator);
    setDraftStart(nextStart);
    setDraftEnd(nextOperator === "between" ? nextEnd : null);
    setActivePreset(
      appliedPreset ||
      detectPresetId(nextStart, nextEnd, {
        today,
        onboardedAt,
        operator: nextOperator
      })
    );
    setHoverPreset(null);
    setHoverDay(null);
    setPickingEnd(false);
    stopDragging();
    const dual =
      typeof window !== "undefined" && window.innerWidth >= DUAL_CALENDAR_MIN_WIDTH;
    setLeftMonth(
      resolveViewLeftMonth({
        start: nextStart,
        end: nextOperator === "between" ? nextEnd : null,
        maxDate: today,
        betweenDual: nextOperator === "between" && dual
      })
    );
  };

  const handleOpen = () => {
    setToday(toDateOnly(new Date()));
    syncFromProps();
    setOpen(true);
  };

  const handleOperatorChange = (nextOperator) => {
    setDraftOperator(nextOperator);
    setHoverPreset(null);
    setHoverDay(null);
    setPickingEnd(false);
    stopDragging();
    setDraftStart(null);
    setDraftEnd(null);
    setActivePreset(null);
    const dual =
      typeof window !== "undefined" && window.innerWidth >= DUAL_CALENDAR_MIN_WIDTH;
    setLeftMonth(
      resolveViewLeftMonth({
        start: null,
        end: null,
        maxDate: today,
        betweenDual: nextOperator === "between" && dual
      })
    );
  };

  const applyPreset = (presetId) => {
    setHoverPreset(null);
    setHoverDay(null);
    setActivePreset(presetId);
    setPickingEnd(false);
    stopDragging();

    const range = resolvePresetRange(presetId, { today, onboardedAt });
    if (!range) return;
    setDraftStart(range.start);
    setDraftEnd(draftOperator === "between" ? range.end : null);
    setLeftMonth(
      resolveViewLeftMonth({
        start: range.start,
        end: draftOperator === "between" ? range.end : null,
        maxDate: today,
        betweenDual
      })
    );
  };

  const completeBetweenRange = (day) => {
    const safeDay = clampToMaxDay(day, maxDate);
    if (!draftStart || !safeDay) return;
    if (isSameDay(safeDay, draftStart)) {
      setDraftEnd(safeDay);
      setPickingEnd(false);
      stopDragging();
      setHoverDay(null);
      return;
    }
    if (isBeforeDay(safeDay, draftStart)) {
      setDraftEnd(draftStart);
      setDraftStart(safeDay);
    } else {
      setDraftEnd(safeDay);
    }
    setPickingEnd(false);
    stopDragging();
    setHoverDay(null);
  };

  const handleSelectDay = (day) => {
    if (ignoreClickRef.current) {
      ignoreClickRef.current = false;
      return;
    }

    const safeDay = clampToMaxDay(day, maxDate);
    if (!safeDay || isAfterDay(day, maxDate)) return;

    setActivePreset("custom");
    setHoverPreset(null);

    if (draftOperator !== "between") {
      setDraftStart(safeDay);
      setDraftEnd(null);
      setPickingEnd(false);
      stopDragging();
      setHoverDay(null);
      return;
    }

    if (isDraggingRef.current) return;

    if (pickingEnd && draftStart && !draftEnd) {
      completeBetweenRange(safeDay);
      return;
    }

    setDraftStart(safeDay);
    setDraftEnd(null);
    setPickingEnd(true);
    setHoverDay(safeDay);
  };

  const handleDayHover = (day) => {
    if (draftOperator !== "between") return;
    if (!pickingEnd) return;
    if (!draftStart || draftEnd) return;
    if (maxDate && isAfterDay(day, maxDate)) return;
    setHoverDay(day);
  };

  const handleDayPressStart = (day) => {
    if (draftOperator !== "between") return;
    const safeDay = clampToMaxDay(day, maxDate);
    if (!safeDay || isAfterDay(day, maxDate)) return;
    setActivePreset("custom");
    setHoverPreset(null);
    if (!pickingEnd || draftEnd) {
      setDraftStart(safeDay);
      setDraftEnd(null);
      setPickingEnd(true);
      setHoverDay(safeDay);
    }
    isDraggingRef.current = true;
    setIsDragging(true);
  };

  const handleDayPressEnd = (day) => {
    if (draftOperator !== "between") return;
    if (!isDraggingRef.current) return;
    stopDragging();
    if (!draftStart || draftEnd) return;
    const safeDay = clampToMaxDay(day, maxDate);
    if (safeDay && !isSameDay(safeDay, draftStart)) {
      completeBetweenRange(safeDay);
      ignoreClickRef.current = true;
    }
  };

  useEffect(() => {
    if (!isDragging) return undefined;
    const onUp = () => stopDragging();
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, [isDragging]);

  const handleCancel = () => {
    syncFromProps();
    setOpen(false);
  };

  const handleClear = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setDraftStart(null);
    setDraftEnd(null);
    setActivePreset(null);
    setHoverPreset(null);
    setHoverDay(null);
    setPickingEnd(false);
    stopDragging();
    if (onClear) {
      onClear();
    } else if (onApply) {
      onApply({
        operator: null,
        startDate: null,
        endDate: null,
        preset: null
      });
    }
  };

  const handleApply = () => {
    if (draftOperator === "between") {
      if (!draftStart || !draftEnd) return;
      const rawStart = isBeforeDay(draftEnd, draftStart) ? draftEnd : draftStart;
      const rawEnd = isBeforeDay(draftEnd, draftStart) ? draftStart : draftEnd;
      const start = clampToMaxDay(rawStart, maxDate);
      const end = clampToMaxDay(rawEnd, maxDate);
      if (!start || !end) return;
      onApply?.({
        operator: "between",
        startDate: formatIsoDate(start),
        endDate: formatIsoDate(end),
        preset: activePreset || detectPresetId(start, end, { today, onboardedAt, operator: "between" })
      });
            setOpen(false);
      return;
    }

    if (!draftStart) return;
    const start = clampToMaxDay(draftStart, maxDate);
    if (!start) return;
    onApply?.({
      operator: draftOperator,
      startDate: formatIsoDate(start),
      endDate: null,
      preset: activePreset || detectPresetId(draftStart, null, { today, onboardedAt, operator: draftOperator })
    });
        setOpen(false);
  };

  const hasActiveDateFilter = Boolean(
    startDate || endDate || (appliedPreset && appliedPreset !== "custom")
  );

  const canClear = Boolean(
    hasActiveDateFilter || draftStart || draftEnd || (activePreset && activePreset !== "custom")
  );

  const canApply =
    draftOperator === "between"
      ? Boolean(draftStart && draftEnd)
      : Boolean(draftStart);

  const renderPresetButton = (preset, { compact = false } = {}) => {
    const active = activePreset === preset.id && !hoverPreset;
    const hovered = hoverPreset === preset.id;
    return (
      <button
        key={preset.id}
        type="button"
        onMouseEnter={() => setHoverPreset(preset.id)}
        onMouseLeave={() => setHoverPreset(null)}
        onFocus={() => setHoverPreset(preset.id)}
        onBlur={() => setHoverPreset(null)}
        onClick={() => applyPreset(preset.id)}
        className={
          compact
            ? `shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors cursor-pointer ${active
              ? "bg-[var(--drp-accent-soft)] text-[var(--drp-accent)] ring-1 ring-[var(--drp-accent)]/35"
              : "bg-[var(--drp-canvas)] text-[var(--drp-ink)]"
            }`
            : `flex w-full min-w-0 cursor-pointer items-center px-3.5 py-2.5 text-left text-[13px] transition-colors border-b border-[var(--drp-canvas)] last:border-b-0 ${active
              ? "bg-[var(--drp-accent-soft)] font-semibold text-[var(--drp-accent)]"
              : hovered
                ? "bg-[var(--drp-canvas)] font-semibold text-[var(--drp-accent-strong)]"
                : "font-medium text-[var(--drp-ink)] hover:bg-[var(--drp-canvas)]"
            }`
        }
      >
        <span className="min-w-0 truncate">{preset.label}</span>
      </button>
    );
  };

  return (
    <div ref={rootRef} className={`date-range-picker relative min-w-0 ${className}`.trim()}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : handleOpen())}
        className={`inline-flex h-[42px] w-full max-w-full items-center gap-2 rounded-[7px] border bg-[var(--drp-surface)] px-2.5 sm:px-3 text-left text-[12px] sm:text-[13px] font-semibold transition-colors hover:border-[var(--drp-ink-subtle)] cursor-pointer ${hasActiveDateFilter
            ? "border-[var(--drp-accent)] text-[var(--drp-ink)] bg-[var(--drp-accent-soft)]/30"
            : "border-[var(--drp-border-strong)] text-[var(--drp-ink)]"
          }`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={appliedLabel}
        title={appliedLabel}
      >
        <IconCalendarDays className="h-[18px] w-[18px] shrink-0 text-[var(--drp-accent)]" aria-hidden />
        <span className="date-range-picker__label min-w-0 flex-1 truncate">{appliedLabel}</span>
        {hasActiveDateFilter ? (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                handleClear(event);
              }
            }}
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[var(--drp-ink-muted)] hover:bg-[var(--drp-accent)]/20 hover:text-[var(--drp-accent-strong)] transition-colors cursor-pointer"
            title="Clear date filter"
            aria-label="Clear date filter"
          >
            <IconXMark className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </button>

      {createPortal(
      <AnimatePresence>
        {open ? (
          <motion.div
            key="date-filter-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed inset-0 z-[9998] ${isMobileSheet ? "bg-primaryDark/45 sm:hidden" : "hidden bg-textPrimary/20 md:block"}`}
            onMouseDown={() => setOpen(false)}
            aria-hidden
          />
        ) : null}
        {open ? (
          <motion.div
            key="date-filter-panel"
            ref={panelRef}
            role="dialog"
            aria-label="Date filter"
            aria-modal="true"
            initial={
              isMobileSheet
                ? { opacity: 0, y: 40 }
                : { opacity: 0, y: -8 }
            }
            animate={
              isMobileSheet
                ? { opacity: 1, y: 0 }
                : { opacity: 1, y: 0 }
            }
            exit={
              isMobileSheet
                ? { opacity: 0, y: 28 }
                : { opacity: 0, y: -6 }
            }
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={panelStyle || undefined}
            className={`date-range-picker-panel z-[9999] box-border flex max-h-[inherit] min-h-0 min-w-0 flex-col overflow-hidden border border-[var(--drp-border)] bg-[var(--drp-surface)] shadow-[0_18px_50px_rgba(13,59,46,0.18)] ${isMobileSheet ? "rounded-t-2xl border-b-0" : "rounded-xl"
              }`}
            onMouseDown={(event) => event.stopPropagation()}
            onWheel={(event) => event.stopPropagation()}
          >
            {isMobileSheet ? (
              <div className="flex shrink-0 justify-center pb-1 pt-2.5" aria-hidden>
                <span className="h-1 w-10 rounded-full bg-[var(--drp-border-strong)]" />
              </div>
            ) : null}
            <div
              className={`flex min-h-0 w-full flex-1 flex-col ${draftOperator === "between"
                  ? "md:flex-row md:items-stretch"
                  : "sm:flex-row sm:items-stretch"
                }`}
            >
              <aside
                className={`flex w-full shrink-0 flex-col border-b border-[var(--drp-border)] ${draftOperator === "between"
                    ? "md:min-h-0 md:w-[180px] md:border-b-0 md:border-r md:border-[var(--drp-border)] lg:w-[200px]"
                    : "sm:min-h-0 sm:w-[150px] sm:border-b-0 sm:border-r sm:border-[var(--drp-border)] md:w-[160px]"
                  }`}
              >
                {!hideOperatorSelect ? (
                  <div className="shrink-0 border-b border-[var(--drp-border)] p-2.5 sm:p-3">
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--drp-ink-subtle)]">
                        Filter type
                      </span>
                      <AsideFieldSelect
                        value={draftOperator}
                        onChange={(next) => handleOperatorChange(next)}
                        options={operatorOptions}
                        ariaLabel="Filter type"
                        className="w-full"
                        triggerClassName="h-9 px-2.5 text-[13px]"
                      />
                    </label>
                  </div>
                ) : null}

                {presets.length ? (
                  <>
                    <div
                      className={`flex gap-1.5 overflow-x-auto overscroll-contain px-2.5 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${draftOperator === "between" ? "md:hidden" : "sm:hidden"
                        }`}
                    >
                      {presets.map((preset) => renderPresetButton(preset, { compact: true }))}
                    </div>
                    <div
                      className={`dashboard-main-scroll hidden min-h-0 flex-1 overflow-y-auto overscroll-contain ${draftOperator === "between" ? "md:block" : "sm:block"
                        }`}
                    >
                      {presets.map((preset) => renderPresetButton(preset))}
                    </div>
                  </>
                ) : null}
              </aside>

              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <div className="dashboard-main-scroll min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-3 sm:p-4">
                  {draftOperator === "between" ? (
                    <div className="mb-3 grid grid-cols-2 gap-2 sm:mb-4">
                      <div
                        className={`min-w-0 rounded-[7px] border px-2.5 py-2 sm:px-3 sm:py-2.5 ${pickingEnd || !draftStart
                            ? "border-[var(--drp-border-strong)]"
                            : "border-[var(--drp-accent)] shadow-[0_0_0_1px_rgba(34,197,94,0.15)]"
                          }`}
                      >
                        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--drp-ink-subtle)]">
                          Start
                        </p>
                        <p className="mt-0.5 truncate text-[13px] sm:text-[15px] font-semibold text-[var(--drp-ink)]">
                          {draftStart ? formatDisplayDate(draftStart) : "Select date"}
                        </p>
                      </div>
                      <div
                        className={`min-w-0 rounded-[7px] border px-2.5 py-2 sm:px-3 sm:py-2.5 ${pickingEnd
                            ? "border-[var(--drp-accent)] shadow-[0_0_0_1px_rgba(34,197,94,0.15)]"
                            : "border-[var(--drp-border-strong)]"
                          }`}
                      >
                        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--drp-ink-subtle)]">
                          End
                        </p>
                        <p className="mt-0.5 truncate text-[13px] sm:text-[15px] font-semibold text-[var(--drp-ink)]">
                          {draftEnd
                            ? formatDisplayDate(draftEnd)
                            : hoverDay && pickingEnd
                              ? formatDisplayDate(hoverDay)
                              : "Select date"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`mb-3 rounded-[7px] border px-2.5 py-2 sm:mb-4 sm:px-3 sm:py-2.5 ${draftStart
                          ? "border-[var(--drp-accent)] shadow-[0_0_0_1px_rgba(34,197,94,0.15)]"
                          : "border-[var(--drp-border-strong)]"
                        }`}
                    >
                      <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--drp-ink-subtle)]">
                        {draftOperator === "before"
                          ? "Before date"
                          : draftOperator === "after"
                            ? "After date"
                            : "Date"}
                      </p>
                      <p className="mt-0.5 truncate text-[13px] sm:text-[15px] font-semibold text-[var(--drp-ink)]">
                        {draftStart ? formatDisplayDate(draftStart) : "Select date"}
                      </p>
                    </div>
                  )}

                  {draftOperator === "between" ? (
                    <div className="mb-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setLeftMonth((prev) => addMonths(prev, -1))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-[7px] border border-[var(--drp-border)] text-[var(--drp-ink-muted)] transition-colors hover:bg-[var(--drp-canvas)] cursor-pointer"
                        aria-label="Previous month"
                      >
                        <IconChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={!canGoNextMonth}
                        onClick={() => {
                          if (!canGoNextMonth) return;
                          setLeftMonth((prev) => addMonths(prev, 1));
                        }}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-[7px] border border-[var(--drp-border)] transition-colors ${
                          canGoNextMonth
                            ? "cursor-pointer text-[var(--drp-ink-muted)] hover:bg-[var(--drp-canvas)]"
                            : "cursor-not-allowed text-[var(--drp-ink-subtle)]/40"
                        }`}
                        aria-label="Next month"
                      >
                        <IconChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}

                  <div
                    className={`grid min-w-0 grid-cols-1 gap-4 ${draftOperator === "between" ? "md:grid-cols-2 md:gap-5 md:[&>*]:min-w-0" : ""
                      }`}
                  >
                    <MonthCalendar
                      monthValue={leftMonth}
                      selectedStart={draftStart}
                      selectedEnd={
                        draftOperator === "between"
                          ? draftEnd || (pickingEnd ? draftStart : null)
                          : draftEnd
                      }
                      previewStart={previewRange?.start}
                      previewEnd={previewRange?.end}
                      today={today}
                      maxDate={
                        betweenDual && maxLeftMonth
                          ? endOfMonth(maxLeftMonth)
                          : maxDate
                      }
                      rangeMode={rangeMode}
                      onSelectDay={handleSelectDay}
                      onDayHover={handleDayHover}
                      onDayPressStart={handleDayPressStart}
                      onDayPressEnd={handleDayPressEnd}
                      onMonthChange={setLeftMonth}
                    />
                    {draftOperator === "between" ? (
                      <div className="hidden md:block">
                        <MonthCalendar
                          monthValue={rightMonth}
                          selectedStart={draftStart}
                          selectedEnd={draftEnd || (pickingEnd ? draftStart : null)}
                          previewStart={previewRange?.start}
                          previewEnd={previewRange?.end}
                          today={today}
                          maxDate={maxDate}
                          rangeMode="between"
                          onSelectDay={handleSelectDay}
                          onDayHover={handleDayHover}
                          onDayPressStart={handleDayPressStart}
                          onDayPressEnd={handleDayPressEnd}
                          onMonthChange={(next) => setLeftMonth(addMonths(next, -1))}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--drp-border)] bg-[var(--drp-surface)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={!canClear}
                    className="inline-flex h-[38px] w-full items-center justify-center rounded-lg border border-[var(--drp-border-strong)] bg-[var(--drp-surface)] px-3 text-[13px] font-semibold text-[var(--drp-ink-muted)] transition-colors hover:border-[var(--drp-ink-subtle)] hover:bg-[var(--drp-canvas)] hover:text-[var(--drp-ink)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-4"
                  >
                    Clear Filter
                  </button>
                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex h-[38px] flex-1 items-center justify-center rounded-lg border border-[var(--drp-border-strong)] bg-[var(--drp-surface)] px-4 text-[13px] font-semibold text-[var(--drp-ink)] transition-colors hover:bg-[var(--drp-canvas)] cursor-pointer sm:flex-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApply}
                      disabled={!canApply}
                      className="drp-btn-apply inline-flex h-[38px] flex-1 items-center justify-center rounded-lg px-4 text-[13px] font-semibold transition hover:opacity-90 cursor-pointer sm:flex-none"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body
      )}
    </div>
  );
}