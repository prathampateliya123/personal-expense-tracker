/**
 * components/ui/Select.jsx
 * Custom dropdown select — portal menu, keyboard-friendly, fintech theme.
 */

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconChevronDown } from "./Icons";
import { computeDropdownStyle } from "../../utils/dropdownPosition";

const sizeTriggerClasses = {
  sm: "h-[42px] py-2 pl-3 pr-3 text-sm",
  md: "py-2.5 pl-4 pr-3 text-sm min-h-[44px]",
};

const fireChangeEvent = (onChange, name, value) => {
  if (!onChange) return;
  onChange({
    target: { value: String(value), name: name || "" },
    currentTarget: { value: String(value), name: name || "" },
  });
};

/**
 * @param {object} props
 * @param {string} [props.id]
 * @param {string} [props.name]
 * @param {string} [props.label]
 * @param {string} [props.labelClassName]
 * @param {string} props.value
 * @param {function} props.onChange
 * @param {string[] | {value: string, label: string}[]} props.options
 * @param {string} [props.placeholder]
 * @param {string} [props.error]
 * @param {boolean} [props.disabled]
 * @param {"sm"|"md"} [props.size]
 * @param {string} [props.className]
 * @param {boolean} [props.autoWidth]
 * @param {"left"|"right"} [props.menuAlign]
 * @param {number} [props.menuMinWidth]
 * @param {boolean} [props.matchWidth]
 * @param {string} [props.ariaLabel]
 */
const Select = ({
  id,
  name,
  label,
  labelClassName = "mb-1.5 block text-sm font-medium text-textPrimary",
  value,
  onChange,
  options = [],
  placeholder,
  error,
  disabled = false,
  size = "md",
  className = "",
  autoWidth = false,
  menuAlign = "left",
  menuMinWidth,
  matchWidth = false,
  ariaLabel,
}) => {
  const listId = useId();
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);

  const normalizedOptions = useMemo(
    () =>
      options.map((option) =>
        typeof option === "string" ? { value: option, label: option } : option
      ),
    [options]
  );

  const selected =
    normalizedOptions.find((option) => String(option.value) === String(value)) ||
    null;

  const labelText = selected?.label || placeholder || "Select";
  const isPlaceholder = !selected && Boolean(placeholder);

  const sizeLabels = useMemo(() => {
    const labels = normalizedOptions.map((option) => String(option.label ?? ""));
    if (placeholder) labels.push(String(placeholder));
    return [...new Set(labels.filter(Boolean))];
  }, [normalizedOptions, placeholder]);

  const updatePosition = () => {
    const trigger = rootRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menu = menuRef.current;
    const longestLabelLen = sizeLabels.reduce(
      (max, len) => Math.max(max, String(len).length),
      0
    );
    const minW = parseInt(menuMinWidth || 0, 10) || 0;
    const contentWidth = Math.max(minW || 72, Math.ceil(longestLabelLen * 8.5 + 56));
    const triggerWidth = Math.max(0, rect.width || 0);
    const targetWidth =
      matchWidth || (!autoWidth && triggerWidth > 0)
        ? Math.max(contentWidth, triggerWidth, minW || 0)
        : Math.max(contentWidth, minW || 72);

    setMenuStyle(
      computeDropdownStyle(rect, {
        menuWidth: targetWidth,
        menuHeight: menu?.scrollHeight || menu?.offsetHeight || 240,
        align: menuAlign,
        matchWidth: false,
        minMenuWidth: Math.max(minW || 0, contentWidth),
        maxMenuWidth: Math.max(320, targetWidth),
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
      menuRef.current
        ?.querySelector('[aria-selected="true"]')
        ?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, disabled, normalizedOptions.length, autoWidth, menuAlign, menuMinWidth, matchWidth, value, sizeLabels]);

  useEffect(() => {
    if (!open || disabled) return undefined;

    const isInside = (target) =>
      rootRef.current?.contains(target) || menuRef.current?.contains(target);

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

  const triggerSizeClass = sizeTriggerClasses[size] || sizeTriggerClasses.md;

  const triggerBase = `inline-flex w-full items-center justify-between gap-2 rounded-lg border bg-white text-left font-medium outline-none transition-[border-color,box-shadow,background-color] duration-200 ${triggerSizeClass} ${
    disabled
      ? "cursor-not-allowed border-border bg-surfaceGray text-textSecondary opacity-70"
      : error
        ? open
          ? "cursor-pointer border-red-400 shadow-[0_0_0_3px_rgba(248,113,113,0.15)]"
          : "cursor-pointer border-red-400 hover:border-red-400"
        : open
          ? "cursor-pointer border-accentGreen shadow-[0_0_0_3px_rgba(74,222,128,0.2)]"
          : "cursor-pointer border-border hover:border-primaryLight/50 hover:bg-surfaceLight/60"
  }`;

  const chevron = disabled ? null : (
    <IconChevronDown
      className={`h-4 w-4 shrink-0 text-textSecondary transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    />
  );

  const handleSelect = (nextValue) => {
    fireChangeEvent(onChange, name, nextValue);
    setOpen(false);
  };

  const menu =
    !disabled && open && menuStyle
      ? createPortal(
          <div
            ref={menuRef}
            id={listId}
            role="listbox"
            className="dropdown-menu dashboard-main-scroll z-[10050] max-h-[inherit] overflow-x-hidden overflow-y-auto overscroll-contain rounded-lg border border-border bg-white py-1 shadow-[0_12px_40px_rgba(13,59,46,0.12)]"
            style={menuStyle}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {placeholder ? (
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => handleSelect("")}
                className={`dropdown-menu__option ${
                  !value ? "dropdown-menu__option--active" : ""
                }`}
              >
                {placeholder}
              </button>
            ) : null}

            {normalizedOptions.length ? (
              normalizedOptions.map((option) => {
                const active = String(option.value) === String(value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => handleSelect(option.value)}
                    className={`dropdown-menu__option ${
                      active ? "dropdown-menu__option--active" : ""
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {active ? (
                      <svg
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : null}
                  </button>
                );
              })
            ) : (
              <p className="px-3.5 py-3 text-xs text-textSecondary">No options</p>
            )}
          </div>,
          document.body
        )
      : null;

  const triggerButton = (
    <button
      type="button"
      id={id}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        setOpen((prev) => !prev);
      }}
      aria-label={ariaLabel || label || placeholder}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listId}
      className={triggerBase}
    >
      <span
        className={`min-w-0 truncate ${
          isPlaceholder ? "text-textSecondary" : "text-textPrimary"
        }`}
      >
        {labelText}
      </span>
      {chevron}
    </button>
  );

  const field = autoWidth ? (
    <div ref={rootRef} className="relative inline-block shrink-0">
      <div className="inline-grid overflow-visible">
        {sizeLabels.map((sizeLabel) => (
          <span
            key={`size-${sizeLabel}`}
            aria-hidden
            className={`invisible col-start-1 row-start-1 inline-flex items-center justify-between gap-2 overflow-visible whitespace-nowrap border border-transparent ${triggerSizeClass}`}
          >
            <span className="text-sm font-medium">{sizeLabel}</span>
            <IconChevronDown className="h-4 w-4 shrink-0" />
          </span>
        ))}
        <div className="col-start-1 row-start-1 w-full">{triggerButton}</div>
      </div>
      {menu}
    </div>
  ) : (
    <div ref={rootRef} className="relative min-w-0">
      {triggerButton}
      {menu}
    </div>
  );

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      ) : null}
      {field}
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
};

export default Select;
