import { useId } from "react";
import { createPortal } from "react-dom";
import { useModalA11y } from "../../hooks/useModalA11y";
import Button from "../ui/Button";

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirming = false,
  danger = false,
  onConfirm,
  onClose
}) {
  const titleId = useId();
  const { dialogRef } = useModalA11y({
    open,
    onClose,
    disabled: confirming
  });

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--sidebar-bg)]/60 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-[2px] sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !confirming) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex w-full max-w-[440px] max-h-[min(90dvh,calc(100dvh-2rem))] flex-col overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
      >
        <div className="min-h-0 overflow-y-auto bg-[var(--canvas)] px-5 py-4">
          <h3 id={titleId} className="break-words text-[16px] font-bold text-[var(--ink)]">
            {title}
          </h3>
          {description ? (
            <div className="mt-1.5 break-words text-[13px] leading-relaxed text-[var(--ink-muted)]">
              {description}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={confirming}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={danger ? "danger" : "primary"}
            size="md"
            onClick={onConfirm}
            loading={confirming}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}