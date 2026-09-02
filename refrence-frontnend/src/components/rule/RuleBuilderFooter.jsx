import Button from "../ui/Button";

export default function RuleBuilderFooter({
  onCancel,
  onSubmit,
  submitting = false,
  disabled = false,
  submitText,
  cancelText = "Cancel",
  hideSubmit = false
}) {
  const submitButtonText = submitText || "Create Rule";

  return (
    <div className="relative z-20 shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 lg:px-6 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="h-[44px]"
          onClick={onCancel}
          disabled={submitting}
          aria-label={cancelText}
        >
          {cancelText}
        </Button>
        {!hideSubmit ? (
          <Button
            type="button"
            size="md"
            className="h-[44px] min-w-[120px]"
            onClick={onSubmit}
            disabled={disabled}
            loading={submitting}
            aria-label={submitButtonText}
          >
            {submitButtonText}
          </Button>
        ) : null}
      </div>
    </div>
  );
}