import Button from "../ui/Button";

export default function TableToolbarActionButton({
  label,
  loadingLabel,
  isLoading = false,
  icon: Icon,
  onClick,
  disabled = false,
  variant = "primary",
  title
}) {
  const spinnerBorder =
    variant === "secondary"
      ? "border-[var(--ink)]/20 border-t-[var(--ink)]"
      : "border-white/30 border-t-white";

  return (
    <Button
      type="button"
      size="md"
      variant={variant}
      onClick={onClick}
      disabled={disabled || isLoading}
      className="table-toolbar__action !h-[42px] !min-h-[42px] !px-2.5 sm:!px-3.5"
      aria-label={label}
      title={title || label}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <span
          className={`table-toolbar__action-icon animate-spin rounded-full border-2 ${spinnerBorder}`}
          aria-hidden
        />
      ) : (
        <span className="table-toolbar__action-icon" aria-hidden>
          <Icon className="h-full w-full" />
        </span>
      )}
      <span className="table-toolbar__action-label">
        {isLoading ? loadingLabel || `${label}...` : label}
      </span>
    </Button>
  );
}
