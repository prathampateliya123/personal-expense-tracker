import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDaysIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "./Icons";
import { MONTHS_SHORT, NON_DIGIT_REGEX } from "../../utils/constants";
import { computeDropdownStyle } from "../../utils/dropdownPosition";
import {
  addMonths,
  formatIsoDate,
  getMonthMatrix,
  isSameDay,
  startOfMonth,
  toDateOnly
} from "../../utils/report";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const PANEL_WIDTH = 292;
const YEAR_GRID_SIZE = 12;
const DATE_MASK_PLACEHOLDER = "DD-MM-YYYY";

const SLOT_CARET = [0, 1, 3, 4, 6, 7, 8, 9];
const CARET_AFTER_SLOT = [1, 3, 4, 6, 7, 8, 9, 10];

function formatDdMmYyyy(value) {
  const date = toDateOnly(value);
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
}

function slotsFromText(raw) {
  const slots = Array(8).fill("");
  const parts = String(raw ?? "").split("-");
  const day = String(parts[0] || "").replace(NON_DIGIT_REGEX, "").slice(0, 2);
  const month = String(parts[1] || "").replace(NON_DIGIT_REGEX, "").slice(0, 2);
  const year = String(parts[2] || "").replace(NON_DIGIT_REGEX, "").slice(0, 4);
  day.split("").forEach((digit, index) => {
    slots[index] = digit;
  });
  month.split("").forEach((digit, index) => {
    slots[2 + index] = digit;
  });
  year.split("").forEach((digit, index) => {
    slots[4 + index] = digit;
  });
  return slots;
}

function textFromSlots(slots) {
  const lastFilled = slots.reduce((last, digit, index) => (digit ? index : last), -1);
  if (lastFilled < 0) return "";
  const day = `${slots[0]}${slots[1]}`;
  const month = `${slots[2]}${slots[3]}`;
  const year = `${slots[4]}${slots[5]}${slots[6]}${slots[7]}`;
  if (lastFilled <= 1) return day;
  if (lastFilled <= 3) return `${day}-${month}`;
  return `${day}-${month}-${year}`;
}

function hasFilledSlotAfter(slots, index) {
  return slots.some((digit, slotIndex) => slotIndex > index && digit);
}

function writeSlotCaret(caret) {
  if (caret <= 0) return 0;
  if (caret === 1) return 1;
  if (caret <= 3) return 2;
  if (caret === 4) return 3;
  if (caret <= 6) return 4;
  if (caret === 7) return 5;
  if (caret === 8) return 6;
  if (caret === 9) return 7;
  return 8;
}

function backspaceSlotCaret(caret) {
  if (caret <= 0) return -1;
  if (caret === 1) return 0;
  if (caret <= 3) return 1;
  if (caret === 4) return 2;
  if (caret <= 6) return 3;
  if (caret === 7) return 4;
  if (caret === 8) return 5;
  if (caret === 9) return 6;
  return 7;
}

function deleteSlotCaret(caret) {
  return writeSlotCaret(caret);
}

function parseDdMmYyyy(raw) {
  const match = String(raw || "").trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
}

function startOfYearGrid(year) {
  return Math.floor(year / YEAR_GRID_SIZE) * YEAR_GRID_SIZE;
}

export default function DatePicker({
  value = "",
  onChange,
  placeholder = DATE_MASK_PLACEHOLDER,
  className = "",
  triggerClassName = "",
  ariaLabel,
  disabled = false,
  readOnly = false
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const skipBeforeInputRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("days");
  const [menuStyle, setMenuStyle] = useState(null);
  const selected = toDateOnly(value);
  const today = useMemo(() => toDateOnly(new Date()), []);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(selected || today)
  );
  const [text, setText] = useState(() => (selected ? formatDdMmYyyy(selected) : ""));

  const weeks = useMemo(() => getMonthMatrix(visibleMonth), [visibleMonth]);
  const yearStart = startOfYearGrid(visibleMonth.getFullYear());
  const yearOptions = useMemo(
    () => Array.from({ length: YEAR_GRID_SIZE }, (_, index) => yearStart + index),
    [yearStart]
  );
  const canEdit = !disabled && !readOnly;

  useEffect(() => {
    if (document.activeElement === inputRef.current) return;
    setText(selected ? formatDdMmYyyy(selected) : "");
  }, [value, selected]);

  const updatePosition = () => {
    const trigger = rootRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menu = menuRef.current;
    setMenuStyle(
      computeDropdownStyle(rect, {
        menuWidth: PANEL_WIDTH,
        menuHeight: menu?.offsetHeight || 360,
        align: "left",
        matchWidth: false
      })
    );
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return undefined;
    }
    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    const onReposition = () => updatePosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, visibleMonth, view]);

  useEffect(() => {
    if (!open) return undefined;

    const handleOutsideClick = (event) => {
      if (
        rootRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
      setView("days");
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setView("days");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const commitText = (raw = text) => {
    const next = textFromSlots(slotsFromText(raw));
    if (!next) {
      onChange?.("");
      setText("");
      return;
    }
    const parsed = parseDdMmYyyy(next);
    if (!parsed) {
      setText(selected ? formatDdMmYyyy(selected) : "");
      return;
    }
    onChange?.(formatIsoDate(parsed));
    setText(formatDdMmYyyy(parsed));
    setVisibleMonth(startOfMonth(parsed));
  };

  const applySlots = (slots, caret) => {
    const next = textFromSlots(slots);
    setText(next);
    window.requestAnimationFrame(() => {
      const safeCaret = Math.max(0, Math.min(caret, next.length));
      inputRef.current?.setSelectionRange(safeCaret, safeCaret);
    });
    const parsed = parseDdMmYyyy(next);
    if (parsed) {
      onChange?.(formatIsoDate(parsed));
      setVisibleMonth(startOfMonth(parsed));
    }
  };

  const writeDigit = (digit) => {
    const input = inputRef.current;
    const caret = input?.selectionStart ?? text.length;
    const slots = slotsFromText(text);
    const slot = writeSlotCaret(caret);
    if (slot > 7) return;
    slots[slot] = digit;
    applySlots(slots, CARET_AFTER_SLOT[slot]);
  };

  const backspaceDigit = () => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? 0;
    const end = input?.selectionEnd ?? 0;
    const slots = slotsFromText(text);

    if (start !== end) {
      for (let caret = start; caret < end; caret += 1) {
        const slot = deleteSlotCaret(caret);
        if (slot >= 0 && slot <= 7) slots[slot] = hasFilledSlotAfter(slots, slot) ? "0" : "";
      }
      applySlots(slots, start);
      return;
    }

    const slot = backspaceSlotCaret(start);
    if (slot < 0) return;
    slots[slot] = hasFilledSlotAfter(slots, slot) ? "0" : "";
    applySlots(slots, SLOT_CARET[slot]);
  };

  const deleteDigit = () => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? 0;
    const end = input?.selectionEnd ?? 0;
    const slots = slotsFromText(text);

    if (start !== end) {
      backspaceDigit();
      return;
    }

    const slot = deleteSlotCaret(start);
    if (slot > 7) return;
    if (!slots[slot] && !hasFilledSlotAfter(slots, slot)) return;
    slots[slot] = hasFilledSlotAfter(slots, slot) ? "0" : "";
    applySlots(slots, SLOT_CARET[slot]);
  };

  const pasteDigits = (raw) => {
    const digits = String(raw ?? "").replace(NON_DIGIT_REGEX, "").slice(0, 8);
    if (!digits) return;
    const slots = slotsFromText(text);
    const startSlot = writeSlotCaret(inputRef.current?.selectionStart ?? 0);
    digits.split("").forEach((digit, index) => {
      const slot = startSlot + index;
      if (slot <= 7) slots[slot] = digit;
    });
    const lastSlot = Math.min(7, startSlot + digits.length - 1);
    applySlots(slots, CARET_AFTER_SLOT[lastSlot]);
  };

  const openCalendar = () => {
    if (!canEdit) return;
    setVisibleMonth(startOfMonth(selected || today));
    setView("days");
    setOpen(true);
  };

  const selectDay = (day) => {
    onChange?.(formatIsoDate(day));
    setText(formatDdMmYyyy(day));
    setOpen(false);
    setView("days");
  };

  const shiftVisible = (amount) => {
    if (view === "years") {
      setVisibleMonth((prev) => new Date(prev.getFullYear() + amount * YEAR_GRID_SIZE, prev.getMonth(), 1));
      return;
    }
    if (view === "months") {
      setVisibleMonth((prev) => addMonths(prev, amount * 12));
      return;
    }
    setVisibleMonth((prev) => addMonths(prev, amount));
  };

  const headerLabel =
    view === "years"
      ? `${yearStart} – ${yearStart + YEAR_GRID_SIZE - 1}`
      : view === "months"
        ? String(visibleMonth.getFullYear())
        : null;

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <div
        className={`inline-flex w-full items-center gap-1 ${triggerClassName} ${
          open ? "border-[var(--brand-orange)] shadow-[0_0_0_3px_rgba(246,143,61,0.15)]" : ""
        } ${!canEdit ? "cursor-default" : ""}`}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          value={text}
          readOnly={!canEdit}
          disabled={disabled}
          placeholder={placeholder || DATE_MASK_PLACEHOLDER}
          aria-label={ariaLabel}
          autoComplete="off"
          onBeforeInput={(event) => {
            if (skipBeforeInputRef.current) {
              skipBeforeInputRef.current = false;
              event.preventDefault();
              return;
            }
            if (event.inputType === "insertText" || event.inputType === "insertCompositionText") {
              event.preventDefault();
              if (event.data && /^\d$/.test(event.data)) writeDigit(event.data);
              return;
            }
            if (event.inputType === "insertFromPaste") {
              event.preventDefault();
              pasteDigits(event.data || "");
              return;
            }
            if (event.inputType === "deleteContentBackward") {
              event.preventDefault();
              backspaceDigit();
              return;
            }
            if (event.inputType === "deleteContentForward") {
              event.preventDefault();
              deleteDigit();
            }
          }}
          onChange={(event) => {
            event.preventDefault();
          }}
          onFocus={openCalendar}
          onBlur={() => commitText()}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitText(text);
              setOpen(false);
              setView("days");
              return;
            }
            if (event.key === "Backspace") {
              skipBeforeInputRef.current = true;
              event.preventDefault();
              backspaceDigit();
              return;
            }
            if (event.key === "Delete") {
              skipBeforeInputRef.current = true;
              event.preventDefault();
              deleteDigit();
              return;
            }
            if (event.ctrlKey || event.metaKey || event.altKey) return;
            if (event.key.length === 1 && /^\d$/.test(event.key)) {
              skipBeforeInputRef.current = true;
              event.preventDefault();
              writeDigit(event.key);
              return;
            }
            if (event.key.length === 1) {
              event.preventDefault();
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            pasteDigits(event.clipboardData.getData("text"));
          }}
          className="min-w-0 flex-1 bg-transparent text-left text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-subtle)]"
        />
        <button
          type="button"
          disabled={!canEdit}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (!canEdit) return;
            if (open) {
              setOpen(false);
              setView("days");
              return;
            }
            openCalendar();
          }}
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-[var(--brand-orange)] cursor-pointer disabled:cursor-default"
          aria-label="Open calendar"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={listId}
        >
          <CalendarDaysIcon className="h-4 w-4" />
        </button>
      </div>

      {open && menuStyle
        ? createPortal(
            <div
              ref={menuRef}
              id={listId}
              role="dialog"
              aria-label={ariaLabel || "Choose date"}
              className="z-[9999] overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_12px_40px_rgba(17,24,39,0.14)]"
              style={{ ...menuStyle, width: PANEL_WIDTH, minWidth: PANEL_WIDTH }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between gap-1">
                <div className="flex min-w-0 items-center gap-0.5">
                  {view === "days" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setView("months")}
                        className="inline-flex items-center gap-0.5 rounded-[6px] px-1.5 py-1 text-[13px] font-semibold text-[var(--ink)] hover:bg-[var(--brand-orange-soft)] hover:text-[var(--brand-orange-strong)] cursor-pointer"
                      >
                        {MONTHS_SHORT[visibleMonth.getMonth()]}
                        <ChevronDownIcon className="h-3 w-3" strokeWidth={2.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setView("years")}
                        className="inline-flex items-center gap-0.5 rounded-[6px] px-1.5 py-1 text-[13px] font-semibold text-[var(--ink)] hover:bg-[var(--brand-orange-soft)] hover:text-[var(--brand-orange-strong)] cursor-pointer"
                      >
                        {visibleMonth.getFullYear()}
                        <ChevronDownIcon className="h-3 w-3" strokeWidth={2.5} />
                      </button>
                    </>
                  ) : (
                    <p className="px-1.5 py-1 text-[13px] font-semibold text-[var(--ink)]">
                      {headerLabel}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => shiftVisible(-1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] text-[var(--ink-muted)] transition-colors hover:bg-[var(--brand-orange-soft)] hover:text-[var(--brand-orange-strong)] cursor-pointer"
                    aria-label="Previous"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftVisible(1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] text-[var(--ink-muted)] transition-colors hover:bg-[var(--brand-orange-soft)] hover:text-[var(--brand-orange-strong)] cursor-pointer"
                    aria-label="Next"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {view === "months" ? (
                <div className="grid grid-cols-3 gap-1 py-1">
                  {MONTHS_SHORT.map((month, index) => {
                    const active = visibleMonth.getMonth() === index;
                    return (
                      <button
                        key={month}
                        type="button"
                        onClick={() => {
                          setVisibleMonth(new Date(visibleMonth.getFullYear(), index, 1));
                          setView("days");
                        }}
                        className={`h-9 rounded-[7px] text-[13px] font-semibold cursor-pointer ${
                          active
                            ? "bg-[var(--brand-orange)] text-white"
                            : "text-[var(--ink)] hover:bg-[var(--brand-orange-soft)] hover:text-[var(--brand-orange-strong)]"
                        }`}
                      >
                        {month}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {view === "years" ? (
                <div className="grid grid-cols-3 gap-1 py-1">
                  {yearOptions.map((year) => {
                    const active = visibleMonth.getFullYear() === year;
                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => {
                          setVisibleMonth(new Date(year, visibleMonth.getMonth(), 1));
                          setView("days");
                        }}
                        className={`h-9 rounded-[7px] text-[13px] font-semibold cursor-pointer ${
                          active
                            ? "bg-[var(--brand-orange)] text-white"
                            : "text-[var(--ink)] hover:bg-[var(--brand-orange-soft)] hover:text-[var(--brand-orange-strong)]"
                        }`}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {view === "days" ? (
                <>
                  <div className="mb-1 grid grid-cols-7">
                    {WEEKDAYS.map((day) => (
                      <div
                        key={day}
                        className="py-1 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--ink-subtle)]"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7">
                    {weeks.flat().map((day) => {
                      const inMonth = day.getMonth() === visibleMonth.getMonth();
                      const isSelected = selected && isSameDay(day, selected);
                      const isToday = today && isSameDay(day, today);

                      return (
                        <button
                          key={formatIsoDate(day)}
                          type="button"
                          onClick={() => selectDay(day)}
                          className={`flex h-8 w-full items-center justify-center text-[13px] cursor-pointer ${
                            inMonth ? "text-[var(--ink)]" : "text-[var(--ink-subtle)]"
                          }`}
                        >
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-[6px] ${
                              isSelected
                                ? "bg-[var(--brand-orange)] font-semibold text-white"
                                : isToday
                                  ? "font-semibold text-[var(--brand-orange)] ring-1 ring-[var(--brand-orange)]/40"
                                  : "hover:bg-[var(--brand-orange-soft)] hover:text-[var(--brand-orange-strong)]"
                            }`}
                          >
                            {day.getDate()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}

              <div className="mt-2 flex items-center justify-between border-t border-[var(--border)] pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onChange?.("");
                    setText("");
                    setOpen(false);
                    setView("days");
                  }}
                  className="text-[13px] font-semibold text-[var(--brand-orange)] hover:text-[var(--brand-orange-strong)] cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVisibleMonth(startOfMonth(today));
                    selectDay(today);
                  }}
                  className="text-[13px] font-semibold text-[var(--brand-orange)] hover:text-[var(--brand-orange-strong)] cursor-pointer"
                >
                  Today
                </button>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}