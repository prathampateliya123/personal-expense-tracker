import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon } from './Icons';
import Field from "./Field";
import { computeDropdownStyle } from "../../utils/dropdownPosition";

function filterCountries(countries, search) {
  const query = search.trim().toLowerCase();
  if (!query) return countries;

  return countries.filter((country) => {
    const name = String(country.name || "").toLowerCase();
    const dialCode = String(country.dialCode || "").toLowerCase();
    const isoCode = String(country.isoCode || "").toLowerCase();
    return name.includes(query) || dialCode.includes(query) || isoCode.includes(query);
  });
}

export default function CountrySelect({
  countries = [],
  value = "",
  onChange,
  name = "country",
  mode = "name",
  label,
  required = false,
  error = false,
  errorMessage = "",
  errorDisplay = "tooltip",
  hint,
  layout = "stack",
  size = "md",
  placeholder = "Choose a country",
  className = "",
  triggerClassName = "",
  disabled = false
}) {
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const listRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [menuStyle, setMenuStyle] = useState(null);

  const isCodeMode = mode === "code";
  const sizeClass = size === "lg" ? "h-[50px] px-[14px] py-[12px]" : "h-[44px] px-[14px]";
  const borderClass = error
    ? "border-red-500 focus:border-red-500"
    : open
      ? "border-[var(--brand-orange)] shadow-[0_0_0_3px_rgba(246,143,61,0.15)]"
      : "border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--brand-orange)]";

  const selectedCountry = useMemo(() => {
    if (isCodeMode) {
      return countries.find((country) => country.isoCode === value) || countries[0] || null;
    }
    return countries.find((country) => country.name === value) || null;
  }, [countries, value, isCodeMode]);

  const filteredCountries = useMemo(
    () => filterCountries(countries, search),
    [countries, search]
  );

  const close = () => {
    setOpen(false);
    setSearch("");
  };

  const updatePosition = () => {
    const trigger = rootRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menu = menuRef.current;
    setMenuStyle(
      computeDropdownStyle(rect, {
        menuWidth: isCodeMode ? 280 : rect.width,
        menuHeight: menu?.offsetHeight || 280,
        matchWidth: !isCodeMode
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
    return () => window.cancelAnimationFrame(frame);
  }, [open, isCodeMode, filteredCountries.length, search]);

  useEffect(() => {
    if (!open) return undefined;

    const isInside = (target) =>
      rootRef.current?.contains(target) || menuRef.current?.contains(target);

    const handleOutsideClick = (event) => {
      if (!isInside(event.target)) close();
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") close();
    };

    const onReposition = () => updatePosition();

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
  }, [open, isCodeMode]);

  useEffect(() => {
    if (!open || !listRef.current || !selectedCountry) return;
    const key = isCodeMode ? selectedCountry.isoCode : selectedCountry.name;
    listRef.current.querySelector(`[data-key="${CSS.escape(String(key))}"]`)?.scrollIntoView({
      block: "nearest"
    });
  }, [open, selectedCountry, isCodeMode]);

  const handleSelect = (country) => {
    onChange?.({
      target: {
        name: isCodeMode ? name || "countryIso" : name,
        value: isCodeMode ? country.isoCode : country.name
      }
    });
    close();
  };

  const selectedKey = isCodeMode ? selectedCountry?.isoCode : selectedCountry?.name;

  const panel =
    open && menuStyle
      ? createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="z-[9999] overflow-hidden rounded-[7px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_40px_rgba(17,24,39,0.12)]"
            onMouseDown={(event) => event.stopPropagation()}
            onWheel={(event) => event.stopPropagation()}
          >
            <div className="border-b border-[var(--border)] p-2">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search country"
                autoFocus
                className="w-full rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-subtle)] focus:border-[var(--brand-orange)]"
              />
            </div>
            <ul
              ref={listRef}
              role="listbox"
              className="max-h-[220px] overflow-y-auto overscroll-contain py-1"
            >
              {filteredCountries.length === 0 ? (
                <li className="px-3 py-3 text-[13px] text-[var(--ink-muted)]">No country found</li>
              ) : (
                filteredCountries.map((country) => {
                  const key = isCodeMode ? country.isoCode : country.name;
                  const isSelected = key === selectedKey;

                  return (
                    <li key={`${country.isoCode}-${country.dialCode}`}>
                      <button
                        type="button"
                        data-key={key}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(country)}
                        className={`flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-left text-[13px] transition-colors ${
                          isSelected
                            ? "bg-[var(--brand-orange)] font-semibold text-white"
                            : "text-[var(--ink)] hover:bg-[var(--brand-orange-soft)] hover:text-[var(--brand-orange-strong)]"
                        }`}
                      >
                        <span className="min-w-0 truncate">{country.name}</span>
                        {country.dialCode ? (
                          <span
                            className={`shrink-0 ${
                              isSelected ? "text-white/80" : "text-[var(--ink-muted)]"
                            }`}
                          >
                            ({country.dialCode})
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>,
          document.body
        )
      : null;

  const trigger = (
    <div
      ref={rootRef}
      className={`relative ${isCodeMode ? "shrink-0" : "w-full"} ${!label ? className : ""}`.trim()}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={
          isCodeMode
            ? `flex h-full w-auto items-center gap-1.5 border-r border-[var(--border)] bg-[var(--surface)] pl-3 pr-2.5 text-[14px] font-medium text-[var(--ink)] outline-none transition-colors hover:bg-[var(--canvas)] disabled:opacity-60 ${triggerClassName}`.trim()
            : `flex w-full items-center justify-between gap-2 rounded-[7px] border bg-[var(--surface)] text-left text-[14px] text-[var(--ink)] outline-none transition-colors disabled:opacity-60 ${sizeClass} ${borderClass} ${triggerClassName}`.trim()
        }
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={isCodeMode ? "Country code" : label || "Country"}
      >
        {isCodeMode ? (
          <>
            <span className="whitespace-nowrap">{selectedCountry?.dialCode || "+91"}</span>
            <ChevronDownIcon
              className={`h-3.5 w-3.5 shrink-0 text-[var(--ink-subtle)] transition-transform ${open ? "rotate-180" : ""}`}
              strokeWidth={2.5}
            />
          </>
        ) : (
          <>
            <span className={selectedCountry ? "truncate" : "truncate text-[var(--ink-subtle)]"}>
              {selectedCountry?.name || placeholder}
            </span>
            <ChevronDownIcon
              className={`h-3.5 w-3.5 shrink-0 text-[var(--ink-subtle)] transition-transform ${open ? "rotate-180" : ""}`}
              strokeWidth={2.5}
            />
          </>
        )}
      </button>
      {panel}
    </div>
  );

  if (!label && !errorMessage) return trigger;

  return (
    <Field
      label={label}
      required={required}
      error={error}
      errorMessage={errorMessage}
      errorDisplay={errorDisplay}
      hint={hint}
      layout={layout}
      className={className}
    >
      {trigger}
    </Field>
  );
}

export function CountryCodeSelect(props) {
  return <CountrySelect mode="code" name={props.name || "countryIso"} {...props} />;
}