import { startTransition, useDeferredValue, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, FunnelIcon, XMarkIcon } from '../ui/Icons';
import Select from "../ui/Select";
import DatePicker from "../ui/DatePicker";
import NumericInput from "../ui/NumericInput";
import { FILTER_TYPE, createEmptyDraft, draftToAppliedFilter, formatFilterChipLabel, getOperatorsForField, getOperatorsForType, getSelectableFilterFields, isBetweenOperator, isDraftComplete } from "../../utils/report";
import { COMMA_REGEX } from "../../utils/constants";
import { computeDropdownStyle } from "../../utils/dropdownPosition";
import TableTruncate from "./TableTruncate";

const WIDE_FILTER_MENU_WIDTH = 400;

function getFilterFieldLabel(draft) {
  return [draft?.fieldName, draft?.field, draft?.displayName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isWideFilterField(draft) {
  const raw = getFilterFieldLabel(draft);
  return raw.includes("campaign") || raw.includes("ad group") || raw.includes("ad_group") || raw.includes("adgroup");
}

const controlBase =
  "h-[36px] sm:h-[38px] rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface)] text-[13px] text-[var(--ink)] outline-none transition-[border-color,box-shadow,background-color] duration-200 focus:border-[var(--brand-orange)] focus:shadow-[0_0_0_3px_rgba(246,143,61,0.15)]";

const menuPanelClass =
  "z-[9999] overflow-hidden rounded-[7px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_40px_rgba(17,24,39,0.12)]";

const menuItemClass = (active) =>
  `flex w-full min-w-0 cursor-pointer items-center px-4 py-2 text-left text-[13px] transition-colors duration-150 ${active
    ? "bg-[var(--brand-orange)] font-semibold text-white"
    : "font-medium text-[var(--ink)] hover:bg-[var(--brand-orange-soft)] hover:text-[var(--brand-orange-strong)]"
  }`;

function PortaledMenu({
  open,
  triggerRef,
  menuRef,
  align = "left",
  matchWidth = true,
  panelWidth,
  className = "",
  children
}) {
  const [style, setStyle] = useState(null);

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menu = menuRef.current;
    const next = computeDropdownStyle(rect, {
      menuWidth: Number(panelWidth) || rect.width,
      menuHeight: menu?.scrollHeight || menu?.offsetHeight || 240,
      align,
      matchWidth: panelWidth ? false : matchWidth,
      maxMenuWidth: panelWidth ? Math.max(Number(panelWidth), 280) : 320
    });

    if (panelWidth) {
      const width = Math.min(
        Math.max(Number(panelWidth), rect.width),
        window.innerWidth - 16
      );
      next.width = width;
      next.minWidth = width;
      next.maxWidth = width;
    }

    setStyle(next);
  };

  useLayoutEffect(() => {
    if (!open) {
      setStyle(null);
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
  }, [open, align, matchWidth, panelWidth]);

  if (!open || !style) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={className}
      style={style}
      onMouseDown={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
}

function Chevron({ open }) {
  return (
    <ChevronDownIcon
      className={`h-3.5 w-3.5 shrink-0 text-[var(--ink-muted)] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "rotate-180" : ""
        }`}
      strokeWidth={2.5}
    />
  );
}

function SearchableDropdownSelect({
  value,
  options,
  onChange,
  placeholder = "Select",
  className = "",
  searchPlaceholder = "Search...",
  menuAlign = "left",
  menuWidth
}) {
  const searchRef = useRef(null);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((option) => option.value === value) || null;

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
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const deferredQuery = useDeferredValue(query);
  const deferredOptions = useDeferredValue(options);
  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return deferredOptions;
    return deferredOptions.filter((option) =>
      String(option.label || "").toLowerCase().includes(q)
    );
  }, [deferredOptions, deferredQuery]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return undefined;
    }
    const timer = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex w-full items-center justify-between gap-2 px-3 text-left font-medium cursor-pointer ${controlBase} ${open
            ? "border-[var(--brand-orange)] shadow-[0_0_0_3px_rgba(246,143,61,0.15)]"
            : "hover:border-[var(--ink-subtle)]"
          }`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
      >
        <span className={`min-w-0 flex-1 overflow-hidden ${selected ? "text-[var(--ink)]" : "text-[var(--ink-subtle)]"}`}>
          {selected ? (
            <TableTruncate
              value={selected.label}
              maxWidthClass=""
              focusable={false}
              tooltipPrefer="top"
              tooltipZIndexClass="z-[10050]"
            />
          ) : (
            <span className="block truncate">{placeholder}</span>
          )}
        </span>
        <Chevron open={open} />
      </button>

      <PortaledMenu
        open={open}
        triggerRef={rootRef}
        menuRef={menuRef}
        align={menuAlign}
        matchWidth={!menuWidth}
        panelWidth={menuWidth}
        className={`${menuPanelClass} min-w-[180px]`}
      >
        <div id={listId} role="listbox">
          <div className="border-b border-[var(--border)] p-2">
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-[34px] w-full rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 text-[13px] outline-none placeholder:text-[var(--ink-subtle)] focus:border-[var(--brand-orange)] focus:shadow-[0_0_0_3px_rgba(246,143,61,0.12)]"
            />
          </div>
          <div className="dashboard-main-scroll max-h-[220px] overflow-y-auto overscroll-contain py-1">
            {filtered.length ? (
              filtered.map((option) => {
                const active = option.value === value;
                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange?.(option.value);
                      setOpen(false);
                    }}
                    className={menuItemClass(active)}
                  >
                    <TableTruncate
                      value={option.label}
                      maxWidthClass=""
                      focusable={false}
                      tooltipPrefer="top"
                      tooltipZIndexClass="z-[10050]"
                    />
                  </button>
                );
              })
            ) : (
              <p className="px-3.5 py-3 text-[12px] text-[var(--ink-subtle)]">No matches</p>
            )}
          </div>
        </div>
      </PortaledMenu>
    </div>
  );
}

function DropdownSelect({
  value,
  options,
  onChange,
  placeholder = "Select",
  className = "",
  searchable = false,
  searchPlaceholder = "Search...",
  menuAlign = "left",
  menuWidth
}) {
  if (searchable) {
    return (
      <SearchableDropdownSelect
        value={value}
        options={options}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        searchPlaceholder={searchPlaceholder}
        menuAlign={menuAlign}
        menuWidth={menuWidth}
      />
    );
  }

  return (
    <Select
      value={value}
      onChange={(next) => onChange?.(next)}
      options={options}
      placeholder={placeholder}
      autoWidth={false}
      className={className}
      triggerClassName="h-[36px] sm:h-[38px] px-3 text-[13px] font-medium"
    />
  );
}

function MultiSelectDropdown({
  values = [],
  options = [],
  onChange,
  placeholder = "Select values",
  className = "",
  searchPlaceholder = "Search...",
  menuWidth
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

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
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return undefined;
    }
    const timer = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  const deferredOptions = useDeferredValue(options);
  const deferredQuery = useDeferredValue(query);
  const optionItems = useMemo(
    () =>
      deferredOptions.map((item) => ({
        value: String(item),
        label: String(item)
      })),
    [deferredOptions]
  );
  const filteredItems = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return optionItems;
    return optionItems.filter((option) => option.label.toLowerCase().includes(q));
  }, [optionItems, deferredQuery]);

  const toggleValue = (value) => {
    if (values.includes(value)) {
      onChange?.(values.filter((item) => item !== value));
      return;
    }
    onChange?.([...values, value]);
  };

  const label =
    values.length === 0
      ? placeholder
      : values.length === 1
        ? values[0]
        : `${values.length} selected`;

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex w-full items-center justify-between gap-2 px-3 text-left font-medium cursor-pointer ${controlBase} ${open
            ? "border-[var(--brand-orange)] shadow-[0_0_0_3px_rgba(246,143,61,0.15)]"
            : "hover:border-[var(--ink-subtle)]"
          }`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
      >
        <span className={`min-w-0 truncate ${values.length ? "" : "text-[var(--ink-subtle)]"}`}>
          {label}
        </span>
        <Chevron open={open} />
      </button>

      <PortaledMenu
        open={open}
        triggerRef={rootRef}
        menuRef={menuRef}
        matchWidth={!menuWidth}
        panelWidth={menuWidth}
        className={menuPanelClass}
      >
        <div
          id={listId}
          role="listbox"
          aria-multiselectable="true"
        >
          <div className="border-b border-[var(--border)] p-2">
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-[34px] w-full rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 text-[13px] outline-none placeholder:text-[var(--ink-subtle)] focus:border-[var(--brand-orange)] focus:shadow-[0_0_0_3px_rgba(246,143,61,0.12)]"
            />
          </div>
          <div className="dashboard-main-scroll max-h-[240px] overflow-y-auto overscroll-contain py-1">
            {filteredItems.length === 0 ? (
              <p className="px-3 py-5 text-center text-[13px] text-[var(--ink-muted)]">
                {optionItems.length === 0 ? "No options" : "No matches"}
              </p>
            ) : (
              filteredItems.map((option) => {
                const checked = values.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={`flex min-w-0 cursor-pointer items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors duration-150 ${checked
                        ? "bg-[var(--brand-orange-soft)] font-semibold text-[var(--brand-orange-strong)]"
                        : "font-medium text-[var(--ink)] hover:bg-[var(--brand-orange-soft)] hover:text-[var(--brand-orange-strong)]"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleValue(option.value)}
                      className="h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-[4px] border border-[var(--border-strong)] bg-[var(--surface)] checked:border-[var(--brand-orange)] checked:bg-[var(--brand-orange)]"
                      style={{
                        backgroundImage: checked
                          ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='3.5 8.5 6.5 11.5 12.5 4.5'/%3E%3C/svg%3E\")"
                          : "none",
                        backgroundSize: "12px 12px",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat"
                      }}
                    />
                    <TableTruncate
                      value={option.label}
                      maxWidthClass=""
                      focusable={false}
                      tooltipPrefer="top"
                      tooltipZIndexClass="z-[10050]"
                    />
                  </label>
                );
              })
            )}
          </div>
        </div>
      </PortaledMenu>
    </div>
  );
}

function MultiValueInput({ values = [], onChange, placeholder = "Type and press Enter" }) {
  const [text, setText] = useState("");

  const addValue = (raw) => {
    const next = String(raw || "").trim();
    if (!next) return;
    if (values.some((item) => item.toLowerCase() === next.toLowerCase())) {
      setText("");
      return;
    }
    onChange?.([...values, next]);
    setText("");
  };

  return (
    <div
      className={`flex min-h-[36px] sm:min-h-[38px] w-full items-center rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-1 focus-within:border-[var(--brand-orange)]`}
    >
      <div className="flex w-full flex-wrap items-center gap-1.5">
        {values.map((item) => (
          <span
            key={item}
            className="inline-flex max-w-full items-center gap-1 rounded-full border border-[var(--brand-orange)]/40 bg-[var(--brand-orange-soft)] px-2 py-0.5 text-[12px] font-medium text-[var(--brand-orange-strong)]"
          >
            <span className="truncate">{item}</span>
            <button
              type="button"
              onClick={() => onChange?.(values.filter((value) => value !== item))}
              className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--brand-orange)] text-white cursor-pointer"
              aria-label={`Remove ${item}`}
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addValue(text.replace(COMMA_REGEX, ""));
            } else if (event.key === "Backspace" && !text && values.length) {
              onChange?.(values.slice(0, -1));
            }
          }}
          onBlur={() => addValue(text)}
          placeholder={values.length ? "" : placeholder}
          className="min-w-[110px] flex-1 bg-transparent py-1 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-subtle)]"
        />
      </div>
    </div>
  );
}

function FilterValueInputs({ draft, onChange }) {
  if (!draft?.field) return null;

  const optionList = Array.isArray(draft.options) ? draft.options : [];
  const hasOptions = optionList.length > 0;
  const selectOptions = optionList.map((item) => ({
    value: String(item),
    label: String(item)
  }));
  const operator = String(draft.operator || "").trim().toLowerCase();
  const isBetween = isBetweenOperator(draft.operator);

  if (isBetween) {
    const isDate = draft.type === FILTER_TYPE.DATE;
    const isNumeric = draft.type === FILTER_TYPE.NUMERIC;

    if (isNumeric) {
      return (
        <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <NumericInput
            value={draft.value}
            onChange={(value) => onChange({ value })}
            allowDecimal
            allowNegative
            placeholder="From"
            className={`w-full min-w-0 flex-1 px-3 ${controlBase} placeholder:text-[var(--ink-subtle)]`}
            aria-label={`${draft.field} from`}
          />
          <span className="hidden shrink-0 text-[12px] font-medium text-[var(--ink-muted)] sm:inline">
            to
          </span>
          <NumericInput
            value={draft.valueTo}
            onChange={(valueTo) => onChange({ valueTo })}
            allowDecimal
            allowNegative
            placeholder="To"
            className={`w-full min-w-0 flex-1 px-3 ${controlBase} placeholder:text-[var(--ink-subtle)]`}
            aria-label={`${draft.field} to`}
          />
        </div>
      );
    }

    if (isDate) {
      return (
        <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <DatePicker
            value={draft.value}
            onChange={(value) => onChange({ value })}
            className="w-full min-w-0 flex-1"
            triggerClassName={`w-full px-3 ${controlBase}`}
            ariaLabel={`${draft.field} from`}
          />
          <span className="hidden shrink-0 text-[12px] font-medium text-[var(--ink-muted)] sm:inline">
            to
          </span>
          <DatePicker
            value={draft.valueTo}
            onChange={(valueTo) => onChange({ valueTo })}
            className="w-full min-w-0 flex-1"
            triggerClassName={`w-full px-3 ${controlBase}`}
            ariaLabel={`${draft.field} to`}
          />
        </div>
      );
    }

    return (
      <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={draft.value}
          onChange={(event) => onChange({ value: event.target.value })}
          placeholder="From"
          className={`w-full min-w-0 flex-1 px-3 ${controlBase} placeholder:text-[var(--ink-subtle)]`}
          aria-label={`${draft.field} from`}
        />
        <span className="hidden shrink-0 text-[12px] font-medium text-[var(--ink-muted)] sm:inline">
          to
        </span>
        <input
          type="text"
          value={draft.valueTo}
          onChange={(event) => onChange({ valueTo: event.target.value })}
          placeholder="To"
          className={`w-full min-w-0 flex-1 px-3 ${controlBase} placeholder:text-[var(--ink-subtle)]`}
          aria-label={`${draft.field} to`}
        />
      </div>
    );
  }

  if (draft.type === FILTER_TYPE.DATE) {
    return (
      <DatePicker
        value={draft.value}
        onChange={(value) => onChange({ value })}
        className="w-full"
        triggerClassName={`w-full px-3 ${controlBase}`}
        ariaLabel={`${draft.field} date`}
      />
    );
  }

  if (hasOptions) {
    const wideMenuWidth = isWideFilterField(draft)
      ? WIDE_FILTER_MENU_WIDTH
      : undefined;

    if (operator === "is_any_of") {
      return (
        <MultiSelectDropdown
          values={draft.values || []}
          options={optionList}
          onChange={(values) => onChange({ values })}
          placeholder={`Select ${draft.field}`}
          searchPlaceholder={`Search ${draft.field}...`}
          className="w-full"
          menuWidth={wideMenuWidth}
        />
      );
    }

    return (
      <DropdownSelect
        value={draft.value}
        options={selectOptions}
        onChange={(value) => onChange({ value })}
        placeholder={`Select ${draft.field}`}
        className="w-full"
        searchable={selectOptions.length > 8}
        searchPlaceholder={`Search ${draft.field}...`}
        menuWidth={wideMenuWidth}
      />
    );
  }

  if (draft.type === FILTER_TYPE.CATEGORICAL && operator === "is_any_of") {
    return (
      <MultiValueInput
        values={draft.values || []}
        onChange={(values) => onChange({ values })}
        placeholder={`Add ${draft.field} values`}
      />
    );
  }

  if (draft.type === FILTER_TYPE.NUMERIC) {
    return (
      <NumericInput
        value={draft.value}
        onChange={(value) => onChange({ value })}
        allowDecimal
        allowNegative
        placeholder={`Enter ${draft.field}`}
        className={`w-full px-3 ${controlBase} placeholder:text-[var(--ink-subtle)]`}
      />
    );
  }

  return (
    <input
      type="text"
      value={draft.value}
      onChange={(event) => onChange({ value: event.target.value })}
      placeholder={`Enter ${draft.field}`}
      className={`w-full px-3 ${controlBase} placeholder:text-[var(--ink-subtle)]`}
    />
  );
}

function FilterChip({ filter, onRemove, onEdit }) {
  const label = formatFilterChipLabel(filter);
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--brand-orange)]/30 bg-[var(--brand-orange-soft)] px-2.5 py-1 text-[12px] font-semibold text-[var(--brand-orange-strong)]">
      <button
        type="button"
        onClick={() => onEdit?.(filter)}
        className="max-w-[180px] truncate sm:max-w-[240px] text-left hover:underline cursor-pointer"
        title="Click to edit filter"
      >
        {label}
      </button>
      <button
        type="button"
        onClick={() => onRemove?.(filter.id)}
        className="inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-[var(--brand-orange)] text-white transition-opacity hover:opacity-90 cursor-pointer"
        aria-label={`Remove filter ${label}`}
      >
        <XMarkIcon className="h-3 w-3" />
      </button>
    </span>
  );
}

export default function TableFilter({
  filterFields = [],
  columns = [],
  visibleColumns = [],
  appliedFilters = [],
  onAppliedFiltersChange,
  leadingSlot = null,
  trailingSlot = null,
  dateSlot = null,
  endSlot = null
}) {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [draft, setDraft] = useState(() => createEmptyDraft());
  const [fieldPickerOpen, setFieldPickerOpen] = useState(false);
  const fieldPickerRef = useRef(null);
  const fieldPickerMenuRef = useRef(null);
  const hasToolbarSlots = Boolean(leadingSlot || trailingSlot || dateSlot || endSlot);

  useEffect(() => {
    if (!fieldPickerOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (
        fieldPickerRef.current?.contains(event.target) ||
        fieldPickerMenuRef.current?.contains(event.target)
      ) {
        return;
      }
      setFieldPickerOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setFieldPickerOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [fieldPickerOpen]);

  const deferredFilterFields = useDeferredValue(filterFields);
  const deferredVisibleColumns = useDeferredValue(visibleColumns);
  const deferredColumns = useDeferredValue(columns);

  const selectableFilterFields = useMemo(
    () =>
      getSelectableFilterFields(
        deferredFilterFields,
        deferredVisibleColumns,
        deferredColumns
      ),
    [deferredFilterFields, deferredVisibleColumns, deferredColumns]
  );

  const fieldOptions = useMemo(
    () =>
      selectableFilterFields.map((item) => ({
        value: item.fieldName || item.field,
        label: item.displayName || item.field,
        meta: item
      })),
    [selectableFilterFields]
  );

  const operatorOptions = useMemo(() => {
    const fromDraft = Array.isArray(draft.operators) ? draft.operators : [];
    const operators =
      fromDraft.length > 0
        ? fromDraft
        : getOperatorsForField({
          type: draft.type,
          operators: draft.operators
        });

    return operators.map((item) => ({
      value: item.value,
      label: item.label
    }));
  }, [draft.operators, draft.type]);

  useEffect(() => {
    if (!builderOpen) return;
    const draftKey = draft.fieldName || draft.field;
    if (!draftKey) return;

    const stillSelectable = selectableFilterFields.some(
      (item) =>
        item.fieldName === draftKey ||
        item.field === draftKey ||
        item.displayName === draftKey
    );

    if (!stillSelectable) {
      setDraft(createEmptyDraft());
      setBuilderOpen(false);
      setFieldPickerOpen(false);
    }
  }, [builderOpen, draft.field, draft.fieldName, selectableFilterFields]);

  if (!filterFields.length && !appliedFilters.length && !hasToolbarSlots) {
    return null;
  }

  const canShowFilterButton =
    !builderOpen && (filterFields.length > 0 || selectableFilterFields.length > 0);

  function appliedFilterToDraft(appliedFilter, selectableFilterFields = []) {
    if (!appliedFilter) return null;

    const key = String(
      appliedFilter.fieldName || appliedFilter.field || appliedFilter.displayName || ""
    ).trim();

    const metaField = selectableFilterFields.find(
      (item) =>
        item.fieldName === key ||
        item.field === key ||
        item.displayName === key
    );

    const operators = metaField
      ? getOperatorsForField(metaField)
      : Array.isArray(appliedFilter.operators) && appliedFilter.operators.length > 0
        ? appliedFilter.operators
        : getOperatorsForType(appliedFilter.type);

    const options = metaField?.options || appliedFilter.options || [];

    return {
      id: metaField?.id ?? appliedFilter.fieldId ?? null,
      editingId: appliedFilter.id,
      field: appliedFilter.field || appliedFilter.displayName || key,
      fieldName: appliedFilter.fieldName || appliedFilter.field || key,
      displayName: appliedFilter.displayName || appliedFilter.field || key,
      type: appliedFilter.type || metaField?.type || "",
      options: Array.isArray(options) ? [...options] : [],
      operators,
      operator: appliedFilter.operator || operators[0]?.value || "",
      value: appliedFilter.value ?? "",
      valueTo: appliedFilter.valueTo ?? "",
      values: Array.isArray(appliedFilter.values) ? [...appliedFilter.values] : []
    };
  }

  const selectField = (fieldKey) => {
    const field = selectableFilterFields.find(
      (item) =>
        item.fieldName === fieldKey ||
        item.field === fieldKey ||
        item.displayName === fieldKey
    );
    if (!field) return;

    const key = String(field.fieldName || field.field || field.displayName).trim();
    const existing = appliedFilters.find(
      (item) =>
        String(item.fieldName || item.field || item.displayName).trim() === key
    );

    if (existing) {
      setDraft(appliedFilterToDraft(existing, selectableFilterFields));
    } else {
      setDraft(createEmptyDraft(field));
    }

    setBuilderOpen(true);
    setFieldPickerOpen(false);
  };

  const handleEditFilter = (appliedFilter) => {
    const draftFromExisting = appliedFilterToDraft(appliedFilter, selectableFilterFields);
    if (!draftFromExisting) return;
    setDraft(draftFromExisting);
    setBuilderOpen(true);
    setFieldPickerOpen(false);
  };

  const updateDraft = (patch) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const handleOperatorChange = (operator) => {
    setDraft((prev) => ({
      ...prev,
      operator,
      value: "",
      valueTo: "",
      values: []
    }));
  };

  const commitFilters = (next) => {
    startTransition(() => {
      onAppliedFiltersChange?.(next);
    });
  };

  const handleApply = () => {
    const next = draftToAppliedFilter(draft);
    if (!next) return;

    const targetId = draft.editingId || next.id;
    const targetKey = String(next.fieldName || next.field || "").trim();

    const existingIndex = appliedFilters.findIndex(
      (item) =>
        item.id === targetId ||
        String(item.fieldName || item.field || "").trim() === targetKey
    );

    if (existingIndex >= 0) {
      const updated = [...appliedFilters];
      updated[existingIndex] = {
        ...next,
        id: appliedFilters[existingIndex].id
      };
      commitFilters(updated);
    } else {
      commitFilters([...appliedFilters, next]);
    }

    setDraft(createEmptyDraft());
    setBuilderOpen(false);
  };

  const handleClearDraft = () => {
    setDraft(createEmptyDraft());
    setBuilderOpen(false);
  };

  const removeFilter = (id) => {
    commitFilters(appliedFilters.filter((item) => item.id !== id));
  };

  const resetAll = () => {
    commitFilters([]);
    setDraft(createEmptyDraft());
    setBuilderOpen(false);
  };

  const canApply = isDraftComplete(draft);

  const filterButton = canShowFilterButton ? (
    <div ref={fieldPickerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setFieldPickerOpen((prev) => !prev)}
        disabled={!selectableFilterFields.length}
        className={`inline-flex h-[42px] shrink-0 items-center gap-1.5 rounded-[7px] border bg-[var(--surface)] px-2.5 sm:px-3 text-[13px] sm:text-[14px] font-semibold text-[var(--ink)] transition-[border-color,box-shadow,background-color] duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${fieldPickerOpen
            ? "border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] shadow-[0_0_0_3px_rgba(246,143,61,0.15)]"
            : "border-[var(--border-strong)] hover:border-[var(--ink-subtle)]"
          }`}
        aria-label="Filter"
        aria-expanded={fieldPickerOpen}
      >
        <FunnelIcon
          className={`h-4 w-4 transition-colors duration-200 ${fieldPickerOpen ? "text-[var(--brand-orange)]" : "text-[var(--ink-muted)]"
            }`}
          aria-hidden
        />
        <span className="hidden sm:inline">Filter</span>
      </button>

      <PortaledMenu
        open={fieldPickerOpen}
        triggerRef={fieldPickerRef}
        menuRef={fieldPickerMenuRef}
        align="left"
        matchWidth={false}
        panelWidth={200}
        className={`${menuPanelClass} w-[min(calc(100vw-2rem),260px)]`}
      >
        <div className="max-h-[260px] overflow-y-auto overscroll-contain py-1">
          {fieldOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => selectField(option.value)}
              className={menuItemClass(false)}
            >
              <span className="truncate">{option.label}</span>
            </button>
          ))}
        </div>
      </PortaledMenu>
    </div>
  ) : null;

  return (
    <div className="relative z-20 rounded-t-[7px] border-b border-[var(--border)] bg-[var(--canvas)] px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="flex flex-col gap-2.5">
        {hasToolbarSlots ? (
          <div className="table-toolbar">
            <div className="table-toolbar__row">
              <div className="table-toolbar__search">
                {leadingSlot ? (
                  <div className="table-toolbar__search-field">{leadingSlot}</div>
                ) : null}
                {filterButton ? <div className="shrink-0">{filterButton}</div> : null}
              </div>

              {trailingSlot || endSlot || dateSlot ? (
                <div className="table-toolbar__controls">
                  <div className="table-toolbar__control-row">
                    {trailingSlot ? (
                      <div className="table-toolbar__tools-wrap">{trailingSlot}</div>
                    ) : null}
                    {endSlot ? (
                      <div className="table-toolbar__controls-end">{endSlot}</div>
                    ) : null}
                    {dateSlot ? (
                      <div className="table-toolbar__date">{dateSlot}</div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
        {builderOpen ? (
          <div className="flex flex-wrap items-center gap-2">
            <DropdownSelect
              value={draft.fieldName || draft.field}
              options={fieldOptions}
              onChange={selectField}
              placeholder="Select field"
              className="w-full sm:w-[168px]"
              searchable
              searchPlaceholder="Search fields..."
            />

            <DropdownSelect
              value={draft.operator}
              options={operatorOptions}
              onChange={handleOperatorChange}
              placeholder="Operator"
              className="w-full sm:w-[168px]"
            />

            <div
              className={`w-full min-w-0 ${isBetweenOperator(draft.operator)
                  ? "sm:w-[320px] md:w-[380px] lg:w-[420px]"
                  : "sm:w-[200px]"
                }`}
            >
              <FilterValueInputs
                draft={draft}
                onChange={(patch) => updateDraft(patch)}
              />
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
              <button
                type="button"
                onClick={handleApply}
                disabled={!canApply}
                className="inline-flex h-[36px] sm:h-[38px] flex-1 sm:flex-none items-center justify-center rounded-[7px] bg-[var(--brand-orange)] px-4 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleClearDraft}
                className="inline-flex h-[36px] sm:h-[38px] flex-1 sm:flex-none items-center justify-center rounded-[7px] border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink-subtle)] hover:bg-[var(--canvas)] cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        ) : null}
        {appliedFilters.length > 0 || (!hasToolbarSlots && filterButton) ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <span className="shrink-0 text-[13px] font-semibold text-[var(--ink)]">Filters:</span>

            {appliedFilters.map((filter) => (
              <FilterChip
                key={filter.id}
                filter={filter}
                onRemove={removeFilter}
                onEdit={handleEditFilter}
              />
            ))}

            {appliedFilters.length > 0 ? (
              <button
                type="button"
                onClick={resetAll}
                className="shrink-0 text-[13px] font-semibold text-[var(--brand-orange)] hover:underline cursor-pointer"
              >
                Reset to default
              </button>
            ) : null}

            {!hasToolbarSlots ? filterButton : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}