import { SearchIcon } from "../ui/Icons";

const SEARCH_PLACEHOLDER = "Search...";

export default function TableSearch({ value, onChange, className = "" }) {
  return (
    <label className={`relative block w-full min-w-0 ${className}`.trim()}>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink)]/40" />
      <input
        type="Search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={SEARCH_PLACEHOLDER}
        className="h-[42px] w-full min-w-0 rounded-[7px] border border-[var(--ink)]/15 bg-[var(--surface)] py-2.5 pl-9 pr-3 text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--ink)]/40 transition-[border-color,box-shadow] duration-200 focus:border-[var(--brand-orange)] focus:shadow-[0_0_0_3px_rgba(246,143,61,0.15)]"
      />
    </label>
  );
}