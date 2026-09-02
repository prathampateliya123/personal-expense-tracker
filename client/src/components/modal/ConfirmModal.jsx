/**
 * components/modal/ConfirmModal.jsx
 * Reusable confirmation dialog — delete and destructive actions.
 */

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
  onClose,
}) {
  const titleId = useId();
  const { dialogRef } = useModalA11y({
    open,
    onClose,
    disabled: confirming,
  });

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-textPrimary/30 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !confirming) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="card flex w-full max-w-md max-h-[min(90dvh,calc(100dvh-2rem))] flex-col overflow-hidden"
      >
        <div className="min-h-0 overflow-y-auto px-5 py-4">
          <h3 id={titleId} className="break-words text-base font-semibold text-textPrimary">
            {title}
          </h3>
          {description ? (
            <p className="mt-2 break-words text-sm leading-relaxed text-textSecondary">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
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
