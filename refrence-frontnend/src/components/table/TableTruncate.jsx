import { useId, useLayoutEffect, useRef, useState } from "react";
import Tooltip from "../ui/Tooltip";

export default function TableTruncate({
  value,
  maxWidthClass = "max-w-[180px]",
  className = "",
  focusable = true,
  tooltipPrefer = "bottom",
  tooltipZIndexClass
}) {
  const text = value == null || value === "" ? "—" : String(value);
  const triggerRef = useRef(null);
  const tipId = useId();
  const [isTruncated, setIsTruncated] = useState(false);
  const [open, setOpen] = useState(false);

  const measureTruncation = () => {
    const el = triggerRef.current;
    if (!el) {
      setIsTruncated(false);
      return;
    }
    setIsTruncated(el.scrollWidth > el.clientWidth + 1);
  };

  useLayoutEffect(() => {
    measureTruncation();

    const el = triggerRef.current;
    if (!el || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measureTruncation);
      return () => window.removeEventListener("resize", measureTruncation);
    }

    const observer = new ResizeObserver(measureTruncation);
    observer.observe(el);
    window.addEventListener("resize", measureTruncation);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureTruncation);
    };
  }, [text, maxWidthClass, className]);

  useLayoutEffect(() => {
    if (!isTruncated && open) setOpen(false);
  }, [isTruncated, open]);

  useLayoutEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const showTooltip = isTruncated && open;

  return (
    <>
      <span
        ref={triggerRef}
        className={`block w-full min-w-0 truncate ${maxWidthClass} ${isTruncated ? "cursor-default" : ""
          } ${className}`.trim()}
        onMouseEnter={() => {
          if (isTruncated) setOpen(true);
        }}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => {
          if (isTruncated) setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        aria-describedby={showTooltip ? tipId : undefined}
        tabIndex={focusable && isTruncated ? 0 : undefined}
      >
        {text}
      </span>

      <Tooltip
        id={tipId}
        open={showTooltip}
        content={text}
        anchorRef={triggerRef}
        prefer={tooltipPrefer}
        zIndexClass={tooltipZIndexClass}
      />
    </>
  );
}