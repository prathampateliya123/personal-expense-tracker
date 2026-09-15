/**
 * components/ui/DateInput.jsx
 * Custom single-date picker for forms — Select-style trigger + calendar popup.
 * (Table date filters use DateRangePicker separately.)
 */

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  IconCalendarDays,
  IconChevronLeft,
  IconChevronRight,
} from "./Icons";
import {
  addMonths,
  formatDisplayDate,
  formatIsoDate,
  getMonthMatrix,
  getMonthOptions,
  isSameDay,
  startOfMonth,
  toDateOnly,
} from "../../utils/dateRange";
import { computeDropdownStyle } from "../../utils/dropdownPosition";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const fireChangeEvent = (onChange, name, value) => {
  if (!onChange) return;
  onChange({
    target: { value: String(value), name: name || "" },
    currentTarget: { value: String(value), name: name || "" },
  });
};

const sizeTriggerClasses = {
  sm: "h-[42px] py-2 pl-3 pr-10 text-sm",
  md: "min-h-[44px] py-2.5 pl-4 pr-10 text-sm",
};

const DateInput = ({
  id,
  name,
  label,
  labelClassName = "mb-1.5 block text-sm font-medium text-textPrimary",
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  min,
  max,
  size = "md",
  className = "",
  placeholder = "Select date",
}) => {
  const listId = useId();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState(null);

  const selected = useMemo(() => toDateOnly(value), [value]);
  const minDate = useMemo(() => toDateOnly(min), [min]);
  const maxDate = useMemo(() => toDateOnly(max), [max]);
  const today = useMemo(() => toDateOnly(new Date()), []);

  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(selected || today || new Date())
  );

  useEffect(() => {
    if (!open) return;
    setViewMonth(startOfMonth(selected || today || new Date()));
  }, [open, selected, today]);

  const weeks = useMemo(
    () => getMonthMatrix(viewMonth || startOfMonth(new Date())),
    [viewMonth]
  );

  const monthLabel = useMemo(() => {
    if (!viewMonth) return "";
    const options = getMonthOptions();
    const monthName =
      options.find((opt) => Number(opt.value) === viewMonth.getMonth())
        ?.label || "";
    return `${monthName} ${viewMonth.getFullYear()}`;
  }, [viewMonth]);

  const displayValue = selected ? formatDisplayDate(selected) : "";
  const isEmpty = !selected;

  const isDisabledDay = (day) => {
    if (minDate && day < minDate) return true;
    if (maxDate && day > maxDate) return true;
    return false;
  };

  const updatePanelPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setPanelStyle(
      computeDropdownStyle(rect, {
        menuWidth: Math.max(rect.width, 288),
        menuHeight: 340,
        matchWidth: false,
        minMenuWidth: 288,
        maxMenuWidth: 320,
        align: "left",
      })
    );
  };

  useLayoutEffect(() => {
    if (!open) return undefined;
    updatePanelPosition();
    const onReposition = () => updatePanelPosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      const inTrigger = rootRef.current?.contains(event.target);
      const inPanel = panelRef.current?.contains(event.target);
      if (!inTrigger && !inPanel) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectDay = (day) => {
    if (isDisabledDay(day)) return;
    fireChangeEvent(onChange, name, formatIsoDate(day));
    setOpen(false);
  };

  const canGoPrev = !minDate || addMonths(viewMonth, -1) >= startOfMonth(minDate);
  const canGoNext =
    !maxDate || addMonths(viewMonth, 1) <= startOfMonth(maxDate);

  return (
    <div className={className} ref={rootRef}>
      {label ? (
        <label htmlFor={id} className={labelClassName}>
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
      ) : null}

      <div className="relative">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          onClick={() => {
            if (disabled) return;
            setOpen((prev) => !prev);
          }}
          className={`date-field relative flex w-full items-center text-left ${
            sizeTriggerClasses[size]
          } ${isEmpty ? "date-field-empty" : ""} ${
            error ? "date-field-error" : ""
          } ${open ? "border-accentGreen ring-2 ring-accentGreen/15" : ""}`}
        >
          <span className={`min-w-0 flex-1 truncate ${isEmpty ? "text-textSecondary" : "text-textPrimary"}`}>
            {displayValue || placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-textSecondary">
            <IconCalendarDays className="h-4 w-4 text-accentGreen" />
          </span>
        </button>
      </div>

      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}

      {open && panelStyle
        ? createPortal(
            <div
              ref={panelRef}
              id={listId}
              role="dialog"
              aria-label={label || "Choose date"}
              className="date-range-picker-panel z-[9999] overflow-hidden rounded-xl border border-[var(--drp-border)] bg-[var(--drp-surface)] p-3 shadow-none"
              style={panelStyle}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={!canGoPrev}
                  onClick={() => {
                    if (!canGoPrev) return;
                    setViewMonth((prev) => addMonths(prev, -1));
                  }}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--drp-border)] transition ${
                    canGoPrev
                      ? "cursor-pointer text-[var(--drp-ink-muted)] hover:bg-[var(--drp-canvas)]"
                      : "cursor-not-allowed text-[var(--drp-ink-subtle)]/40"
                  }`}
                  aria-label="Previous month"
                >
                  <IconChevronLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-semibold text-[var(--drp-ink)]">
                  {monthLabel}
                </p>
                <button
                  type="button"
                  disabled={!canGoNext}
                  onClick={() => {
                    if (!canGoNext) return;
                    setViewMonth((prev) => addMonths(prev, 1));
                  }}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--drp-border)] transition ${
                    canGoNext
                      ? "cursor-pointer text-[var(--drp-ink-muted)] hover:bg-[var(--drp-canvas)]"
                      : "cursor-not-allowed text-[var(--drp-ink-subtle)]/40"
                  }`}
                  aria-label="Next month"
                >
                  <IconChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-0">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--drp-ink-subtle)]"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-0.5">
                {weeks.flat().map((day) => {
                  const inMonth =
                    day.getMonth() === (viewMonth || day).getMonth();
                  const selectedDay = selected && isSameDay(day, selected);
                  const isToday = today && isSameDay(day, today);
                  const disabledDay = isDisabledDay(day);

                  return (
                    <button
                      key={formatIsoDate(day)}
                      type="button"
                      disabled={disabledDay}
                      onClick={() => selectDay(day)}
                      className={`relative flex h-9 items-center justify-center text-[13px] font-medium transition ${
                        disabledDay
                          ? "cursor-not-allowed text-[var(--drp-ink-subtle)]/40"
                          : selectedDay
                            ? "cursor-pointer text-white"
                            : inMonth
                              ? "cursor-pointer text-[var(--drp-ink)] hover:bg-[var(--drp-accent-soft)]"
                              : "cursor-pointer text-[var(--drp-ink-subtle)] hover:bg-[var(--drp-accent-soft)]"
                      }`}
                    >
                      {selectedDay ? (
                        <span className="absolute inset-1 rounded-full bg-[var(--drp-accent)]" />
                      ) : null}
                      <span
                        className={`relative z-[1] ${
                          isToday && !selectedDay
                            ? "underline decoration-[var(--drp-accent)] decoration-2 underline-offset-4"
                            : ""
                        }`}
                      >
                        {day.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--drp-border)] pt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (today && !isDisabledDay(today)) selectDay(today);
                  }}
                  className="text-xs font-semibold text-accentGreen hover:text-primaryMid"
                >
                  Today
                </button>
                {!required ? (
                  <button
                    type="button"
                    onClick={() => {
                      fireChangeEvent(onChange, name, "");
                      setOpen(false);
                    }}
                    className="text-xs font-semibold text-textSecondary hover:text-textPrimary"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
};

export default DateInput;
