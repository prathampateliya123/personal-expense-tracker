import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SearchIcon, ViewColumnsIcon } from '../ui/Icons';

const PANEL_WIDTH = 280;
const VIEWPORT_PAD = 12;
const PANEL_GAP = 8;

function computePanelStyle(triggerEl) {
  if (!triggerEl) {
    return {
      position: "fixed",
      top: VIEWPORT_PAD,
      left: VIEWPORT_PAD,
      width: Math.min(PANEL_WIDTH, window.innerWidth - VIEWPORT_PAD * 2)
    };
  }

  const rect = triggerEl.getBoundingClientRect();
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const width = Math.min(PANEL_WIDTH, viewportW - VIEWPORT_PAD * 2);

  let left = rect.right - width;
  left = Math.max(VIEWPORT_PAD, Math.min(left, viewportW - width - VIEWPORT_PAD));

  const estimatedHeight = 320;
  const spaceBelow = viewportH - rect.bottom - PANEL_GAP - VIEWPORT_PAD;
  const spaceAbove = rect.top - PANEL_GAP - VIEWPORT_PAD;
  const placeAbove = spaceBelow < 220 && spaceAbove > spaceBelow;

  const top = placeAbove
    ? Math.max(VIEWPORT_PAD, rect.top - PANEL_GAP - Math.min(estimatedHeight, spaceAbove))
    : rect.bottom + PANEL_GAP;

  const maxHeight = placeAbove
    ? Math.max(180, spaceAbove)
    : Math.max(180, spaceBelow);

  return {
    position: "fixed",
    top,
    left,
    width,
    maxHeight
  };
}

export default function TableColumns({
  columns = [],
  isColumnVisible,
  isColumnLocked = () => false,
  setColumnVisible,
  visibleCount = 0
}) {
  const panelId = useId();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const searchRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [panelStyle, setPanelStyle] = useState(null);

  const filteredColumns = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return columns;
    return columns.filter((column) => {
      const label = String(column.label || column.key || "").toLowerCase();
      const key = String(column.key || "").toLowerCase();
      return label.includes(q) || key.includes(q);
    });
  }, [columns, query]);

  const updatePanelPosition = () => {
    setPanelStyle(computePanelStyle(triggerRef.current));
  };

  useLayoutEffect(() => {
    if (!open) return undefined;
    updatePanelPosition();
    const frame = window.requestAnimationFrame(updatePanelPosition);
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleOutsideClick = (event) => {
      const inTrigger = rootRef.current?.contains(event.target);
      const inPanel = panelRef.current?.contains(event.target);
      if (!inTrigger && !inPanel) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    const onReposition = () => updatePanelPosition();

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return undefined;
    }

    const timer = window.setTimeout(() => {
      searchRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`table-toolbar__columns-btn inline-flex h-[42px] shrink-0 items-center justify-center gap-1.5 rounded-[7px] border bg-[var(--surface)] px-2.5 text-[13px] font-semibold text-[var(--ink)] transition-[border-color,box-shadow,background-color] duration-200 cursor-pointer sm:px-3 sm:text-[14px] sm:flex-none ${open
            ? "border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] shadow-[0_0_0_3px_rgba(246,143,61,0.15)]"
            : "border-[var(--ink)]/15 hover:border-[var(--ink)]/25 hover:bg-[var(--ink)]/[0.02]"
          }`}
        aria-label="Columns"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <ViewColumnsIcon className="h-[18px] w-[18px] shrink-0 text-[var(--ink)]/70" aria-hidden />
        <span className="table-toolbar__action-label text-[13px] sm:text-[14px]">Column</span>
      </button>

      {open && panelStyle
        ? createPortal(
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-label="Manage columns"
              style={panelStyle}
              className="z-[9999] overflow-hidden rounded-[7px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_40px_rgba(17,24,39,0.12)]"
              onMouseDown={(event) => event.stopPropagation()}
              onWheel={(event) => event.stopPropagation()}
            >
              <div className="border-b border-[var(--border)] p-2.5">
                <label className="relative block">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink)]/40" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search columns..."
                    className="h-[38px] w-full rounded-[7px] border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink)]/40 focus:border-[var(--brand-orange)]"
                  />
                </label>
              </div>

              <div
                className="overflow-y-auto overscroll-contain py-1.5"
                style={{ maxHeight: panelStyle?.maxHeight ? Math.max(120, panelStyle.maxHeight - 62) : 280 }}
              >
                {filteredColumns.length === 0 ? (
                  <p className="px-3.5 py-6 text-center text-[13px] text-[var(--ink)]/50">
                    No columns found
                  </p>
                ) : (
                  filteredColumns.map((column) => {
                    const key = String(column.key);
                    const locked = isColumnLocked(key) || column.hideable === false || column.locked;
                    const checked = locked || isColumnVisible(key);
                    const disableUncheck = locked || (checked && visibleCount <= 1);
                    const inputId = `${panelId}-${key}`;

                    return (
                      <label
                        key={key}
                        htmlFor={inputId}
                        className={`flex cursor-pointer items-center gap-2.5 px-3.5 py-2 transition-colors hover:bg-[var(--brand-orange-soft)] ${
                          disableUncheck ? "opacity-70" : ""
                        }`}
                      >
                        <input
                          id={inputId}
                          type="checkbox"
                          checked={checked}
                          disabled={disableUncheck}
                          onChange={(event) =>
                            setColumnVisible(key, event.target.checked)
                          }
                          className="h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-[4px] border border-[var(--ink)]/25 bg-[var(--surface)] checked:border-[var(--brand-orange)] checked:bg-[var(--brand-orange)] checked:bg-[length:12px_12px] checked:bg-center checked:bg-no-repeat disabled:cursor-not-allowed"
                          style={{
                            backgroundImage: checked
                              ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='3.5 8.5 6.5 11.5 12.5 4.5'/%3E%3C/svg%3E\")"
                              : "none"
                          }}
                        />
                        <span className="min-w-0 truncate text-[13px] font-medium text-[var(--ink)]">
                          {column.label || column.key}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}