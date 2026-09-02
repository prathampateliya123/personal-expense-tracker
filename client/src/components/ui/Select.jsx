/**
 * components/ui/Select.jsx
 * Styled native select with custom chevron and consistent fintech UI.
 */

const ChevronDown = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const sizeClasses = {
  sm: "py-2 pl-3 pr-9 text-sm",
  md: "py-2.5 pl-4 pr-10 text-sm",
};

/**
 * @param {object} props
 * @param {string} [props.id]
 * @param {string} [props.name]
 * @param {string} [props.label]
 * @param {string} [props.labelClassName]
 * @param {string} props.value
 * @param {function} props.onChange
 * @param {string[]} | {value: string, label: string}[]} props.options
 * @param {string} [props.placeholder] - Adds empty first option
 * @param {string} [props.error]
 * @param {boolean} [props.disabled]
 * @param {"sm"|"md"} [props.size]
 * @param {string} [props.className]
 */
const Select = ({
  id,
  name,
  label,
  labelClassName = "mb-1.5 block text-sm font-medium text-ink-700",
  value,
  onChange,
  options = [],
  placeholder,
  error,
  disabled = false,
  size = "md",
  className = "",
}) => {
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option
  );

  const isPlaceholder = placeholder && !value;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`select-field ${sizeClasses[size]} ${
            isPlaceholder ? "text-ink-300" : "text-ink-900"
          } ${error ? "select-field-error" : ""}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {normalizedOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-ink-400">
          <ChevronDown />
        </span>
      </div>

      {error && (
        <p className="mt-1 text-xs text-accent-expense">{error}</p>
      )}
    </div>
  );
};

export default Select;
