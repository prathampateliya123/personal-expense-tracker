/**
 * components/ui/DateInput.jsx
 * Styled native date input with calendar icon — matches Select UI.
 */

const CalendarIcon = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.75}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
    />
  </svg>
);

const sizeClasses = {
  sm: "date-field-sm py-2 pl-3 pr-9 text-sm",
  md: "date-field-md py-2.5 pl-4 pr-10 text-sm",
};

/**
 * @param {object} props
 * @param {string} [props.id]
 * @param {string} [props.name]
 * @param {string} [props.label]
 * @param {string} [props.labelClassName]
 * @param {string} props.value - YYYY-MM-DD or empty
 * @param {function} props.onChange
 * @param {string} [props.error]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.required]
 * @param {string} [props.min]
 * @param {string} [props.max]
 * @param {"sm"|"md"} [props.size]
 * @param {string} [props.className]
 */
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
}) => {
  const isEmpty = !value;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          name={name}
          type="date"
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          className={`date-field ${sizeClasses[size]} ${
            isEmpty ? "date-field-empty" : ""
          } ${error ? "date-field-error" : ""}`}
        />

        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-textSecondary">
          <CalendarIcon />
        </span>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default DateInput;
