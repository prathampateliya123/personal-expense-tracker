export default function FieldErrorTooltip({ id, message, show = false, className = "" }) {
  if (!show || !message) return null;

  return (
    <p
      id={id}
      role="alert"
      className={`mt-1.5 text-[12px] font-medium leading-snug text-red-500 ${className}`.trim()}
    >
      {message}
    </p>
  );
}