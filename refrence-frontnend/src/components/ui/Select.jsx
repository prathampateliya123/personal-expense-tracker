import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon } from "./Icons";
import { computeDropdownStyle } from "../../utils/dropdownPosition";

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = "Select",
  className = "",
  triggerClassName = "h-[36px] px-2.5",
  autoWidth = true,
  menuMinWidth,
  menuAlign = "left",
  matchWidth = false,
  ariaLabel,
  disabled = false,
  open: openProp,
  onOpenChange
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const isControlled = openProp !== undefined;
  const open = isControlled ? Boolean(openProp) : uncontrolledOpen;

  const setOpen = (next) => {
    const resolved = typeof next === "function" ? next(open) : next;
    if (!isControlled) setUncontrolledOpen(resolved);
    onOpenChange?.(resolved);
  };

  const selected = options.find((option) => String(option.value) === String(value)) || null;
  const resolvedSelected =
    selected ||
    (value != null && value !== ""
      ? { label: String(value), value }
      : null);

  const sizeLabels = useMemo(() => {
    const labels = options.map((option) => String(option.label ?? ""));
    if (placeholder) labels.push(String(placeholder));
    return [...new Set(labels.filter(Boolean))];
  }, [options, placeholder]);

  const updatePosition = () => {
    const trigger = rootRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menu = menuRef.current;
    const longestLabelLen = sizeLabels.reduce(
      (max, label) => Math.max(max, String(label).length),
      0
    );
    const minW = parseInt(menuMinWidth || 0, 10) || 0;
    const contentWidth = Math.max(minW || 72, Math.ceil(longestLabelLen * 8.5 + 56));
    const triggerWidth = Math.max(0, rect.width || 0);

    // matchWidth / full-width fields: at least as wide as the trigger.
    // Compact fields (limit): size to content only — never follow a stretched trigger.
    const targetWidth = matchWidth || (!autoWidth && triggerWidth > 0)
      ? Math.max(contentWidth, triggerWidth, minW || 0)
      : Math.max(contentWidth, minW || 72);

    setMenuStyle(
      computeDropdownStyle(rect, {
        menuWidth: targetWidth,
        menuHeight: menu?.scrollHeight || menu?.offsetHeight || 240,
        align: menuAlign,
        matchWidth: false,
        minMenuWidth: Math.max(minW || 0, contentWidth),
        maxMenuWidth: Math.max(320, targetWidth)
      })
    );
  };

  useLayoutEffect(() => {
    if (!open || disabled) {
      setMenuStyle(null);
      return undefined;
    }
    updatePosition();
    const frame = window.requestAnimationFrame(() => {
      updatePosition();
      const active = menuRef.current?.querySelector('[aria-selected="true"]');
      active?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, disabled, options.length, autoWidth, menuAlign, menuMinWidth, matchWidth, value, sizeLabels]);

  useEffect(() => {
    if (!open || disabled) return undefined;

    const isInside = (target) =>
      rootRef.current?.contains(target) || menuRef.current?.contains(target);

    // Capture phase so parents that stopPropagation (e.g. date picker panel)
    // cannot block outside-dismiss.
    const handleOutsideClick = (event) => {
      if (!isInside(event.target)) setOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    const onReposition = () => updatePosition();

    document.addEventListener("mousedown", handleOutsideClick, true);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick, true);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, disabled, autoWidth, menuAlign, menuMinWidth, matchWidth]);

  const defaultHeight = triggerClassName.includes("h-") ? "" : "h-[36px]";
  const defaultPadding = triggerClassName.includes("px-") ? "" : "px-3";

  const triggerBase = `inline-flex items-center justify-between gap-1.5 rounded-[7px] border bg-[var(--surface)] text-left text-[13px] font-medium outline-none transition-[border-color,box-shadow] duration-200 ${defaultHeight} ${defaultPadding} ${disabled
      ? "cursor-default border-[var(--border)] opacity-95"
      : open
        ? "cursor-pointer border-[var(--brand-orange)] shadow-[0_0_0_3px_rgba(246,143,61,0.15)]"
        : "cursor-pointer border-[var(--border)] hover:border-[var(--border-strong)]"
    } ${triggerClassName}`;

  const labelText = resolvedSelected?.label || placeholder;
  const labelClass = resolvedSelected ? "text-[var(--ink)]" : "text-[var(--ink-subtle)]";

  const chevron = disabled ? null : (
    <ChevronDownIcon
      className={`h-3.5 w-3.5 shrink-0 text-[var(--ink-subtle)] transition-transform duration-200 ${open ? "rotate-180" : ""
        }`}
      aria-hidden
    />
  );

  const menu =
    !disabled && open && menuStyle
      ? createPortal(
        <div
          ref={menuRef}
          id={listId}
          role="listbox"
          className="dashboard-main-scroll z-[10050] max-h-[inherit] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[7px] border border-[var(--border)] bg-[var(--surface)] py-1 shadow-[0_12px_40px_rgba(17,24,39,0.12)]"
          style={menuStyle}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          {options.length ? (
            options.map((option) => {
              const active = String(option.value) === String(value);
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange?.(option.value, option);
                    setOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center whitespace-nowrap rounded-none px-3.5 py-2 text-left text-[13px] transition-colors duration-150 ${active
                      ? "bg-[var(--brand-orange)] font-semibold text-white"
                      : "font-medium text-[var(--ink)] hover:bg-[var(--brand-orange-soft)] hover:text-[var(--brand-orange-strong)]"
                    }`}
                >
                  {option.label}
                </button>
              );
            })
          ) : (
            <p className="px-3.5 py-3 text-[12px] text-[var(--ink-subtle)]">No options</p>
          )}
        </div>,
        document.body
      )
      : null;

  if (autoWidth) {
    return (
      <div ref={rootRef} className={`relative inline-block shrink-0 ${className}`}>
        <div className="inline-grid overflow-visible">
          {sizeLabels.map((label) => (
            <span
              key={`size-${label}`}
              aria-hidden
              className={`invisible col-start-1 row-start-1 inline-flex items-center justify-between gap-1 overflow-visible whitespace-nowrap border border-transparent ${triggerClassName}`}
            >
              <span className="text-[13px] font-medium">{label}</span>
              <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 overflow-visible" />
            </span>
          ))}
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (disabled) return;
              setOpen((prev) => !prev);
            }}
            aria-label={ariaLabel}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            className={`col-start-1 row-start-1 w-full overflow-visible ${triggerBase}`}
          >
            <span className={`whitespace-nowrap ${labelClass}`}>{labelText}</span>
            {chevron}
          </button>
        </div>
        {menu}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => !prev);
        }}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={`w-full ${triggerBase}`}
      >
        <span className={`min-w-0 truncate ${labelClass}`}>{labelText}</span>
        {chevron}
      </button>
      {menu}
    </div>
  );
}
