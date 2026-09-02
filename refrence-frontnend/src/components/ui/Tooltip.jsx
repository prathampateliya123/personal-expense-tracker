import { useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const VIEWPORT_PAD = 12;
const TIP_GAP = 10;

export default function Tooltip({
  open = false,
  content,
  anchorRef,
  prefer = "bottom",
  id,
  className = "",
  maxWidthClass = "max-w-[min(320px,calc(100vw-24px))]",
  zIndexClass = "z-[9999]"
}) {
  const tipRef = useRef(null);
  const autoId = useId();
  const tipId = id || autoId;
  const [ready, setReady] = useState(false);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    placement: prefer,
    arrowLeft: 16
  });

  const place = () => {
    const el = anchorRef?.current;
    const tip = tipRef.current;
    if (!el || !tip) return false;

    const rect = el.getBoundingClientRect();
    const tipWidth = tip.offsetWidth;
    const tipHeight = tip.offsetHeight;
    if (!tipWidth || !tipHeight) return false;

    const spaceAbove = rect.top - VIEWPORT_PAD;
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PAD;

    let placement = prefer;
    if (prefer === "bottom") {
      placement =
        tipHeight + TIP_GAP <= spaceBelow || spaceBelow >= spaceAbove
          ? "bottom"
          : "top";
    } else if (prefer === "top") {
      placement =
        tipHeight + TIP_GAP <= spaceAbove || spaceAbove >= spaceBelow
          ? "top"
          : "bottom";
    } else {
      placement =
        tipHeight + TIP_GAP <= spaceBelow || spaceBelow >= spaceAbove
          ? "bottom"
          : "top";
    }

    let left = rect.left + rect.width / 2 - tipWidth / 2;
    left = Math.max(
      VIEWPORT_PAD,
      Math.min(left, window.innerWidth - tipWidth - VIEWPORT_PAD)
    );

    const top =
      placement === "top"
        ? rect.top - tipHeight - TIP_GAP
        : rect.bottom + TIP_GAP;

    const triggerCenter = rect.left + rect.width / 2;
    const arrowLeft = Math.max(
      14,
      Math.min(triggerCenter - left, tipWidth - 14)
    );

    setCoords({ top, left, placement, arrowLeft });
    return true;
  };

  useLayoutEffect(() => {
    if (!open || content == null || content === "") {
      setReady(false);
      return undefined;
    }

    setReady(false);
    let cancelled = false;

    const sync = () => {
      if (cancelled) return;
      if (place()) setReady(true);
    };

    sync();
    const frame = window.requestAnimationFrame(sync);

    const onReposition = () => {
      if (place()) setReady(true);
    };
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [open, content, prefer, anchorRef]);

  if (!open || content == null || content === "") return null;

  return createPortal(
    <div
      ref={tipRef}
      id={tipId}
      role="tooltip"
      className={`pointer-events-none fixed ${zIndexClass} transition-opacity duration-100 ${ready ? "opacity-100" : "opacity-0"
        } ${className}`}
      style={{ top: coords.top, left: coords.left }}
    >
      <div
        className={`relative rounded-[8px] bg-[var(--sidebar-bg)] px-3 py-2 text-[12px] leading-snug font-medium text-white shadow-[0_8px_24px_rgba(15,23,42,0.28)] whitespace-normal break-words ${maxWidthClass}`}
      >
        <span
          aria-hidden="true"
          className={`absolute h-2.5 w-2.5 rotate-45 bg-[var(--sidebar-bg)] ${coords.placement === "top" ? "-bottom-[5px]" : "-top-[5px]"
            }`}
          style={{ left: coords.arrowLeft, marginLeft: -5 }}
        />
        {content}
      </div>
    </div>,
    document.body
  );
}