/**
 * components/table/TableSearch.jsx
 * Debounced search field for table toolbars.
 */

import { IconSearch } from "../ui/Icons";

const SEARCH_PLACEHOLDER = "Search by title...";

export default function TableSearch({ value, onChange, placeholder = SEARCH_PLACEHOLDER, className = "" }) {
  return (
    <label className={`relative block w-full min-w-0 ${className}`.trim()}>
      <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary/60" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="h-[42px] w-full min-w-0 rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm text-textPrimary outline-none transition placeholder:text-textSecondary/60 focus:border-accentGreen focus:ring-2 focus:ring-accentGreen/15"
      />
    </label>
  );
}
