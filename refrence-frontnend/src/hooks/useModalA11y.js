import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useModalA11y({
  open,
  onClose,
  disabled = false,
  initialFocusRef = null
}) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const getFocusable = () => {
      const root = dialogRef.current;
      if (!root) return [];
      return Array.from(root.querySelectorAll(FOCUSABLE)).filter(
        (el) =>
          el instanceof HTMLElement &&
          !el.hasAttribute("disabled") &&
          el.getAttribute("aria-hidden") !== "true" &&
          el.tabIndex !== -1
      );
    };

    const focusInitial = () => {
      if (initialFocusRef?.current instanceof HTMLElement) {
        initialFocusRef.current.focus();
        return;
      }
      const items = getFocusable();
      items[0]?.focus();
    };

    const timer = window.setTimeout(focusInitial, 20);

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        if (disabled) return;
        event.preventDefault();
        event.stopPropagation();
        onClose?.();
        return;
      }

      if (event.key !== "Tab") return;
      const items = getFocusable();
      if (!items.length) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !dialogRef.current?.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !dialogRef.current?.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = prevOverflow;
      const prev = previousFocusRef.current;
      if (prev && typeof prev.focus === "function" && document.contains(prev)) {
        prev.focus();
      }
    };
  }, [open, onClose, disabled, initialFocusRef]);

  return { dialogRef };
}

export default useModalA11y;