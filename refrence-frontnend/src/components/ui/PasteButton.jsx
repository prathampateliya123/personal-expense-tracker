import React, { useRef, useState } from "react";
import Tooltip from "./Tooltip";
import { ClipboardIcon, CheckMarkIcon } from "./Icons";

export default function PasteButton({ onPaste, title = "Paste", className = "" }) {
  const [pasted, setPasted] = useState(false);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handlePaste = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const text = await navigator.clipboard.readText();
      if (onPaste) {
        onPaste(text);
        setPasted(true);
        setOpen(true);
        setTimeout(() => setPasted(false), 1500);
      }
    } catch (err) {
      console.error("Failed to read clipboard text", err);
    }
  };

  const tooltipContent = pasted ? <span className="text-[var(--brand-orange)] font-medium">Pasted!</span> : title;

  return (
    <div className={`absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center z-10 ${className}`}>
      <button
        ref={anchorRef}
        type="button"
        onClick={handlePaste}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={`transition-all duration-200 cursor-pointer shrink-0 active:scale-95 ${
          pasted
            ? "text-[var(--brand-orange)]"
            : "text-[var(--ink-muted)] hover:text-[var(--brand-orange)]"
        }`}
        aria-label="Paste"
      >
        {pasted ? (
          <CheckMarkIcon strokeWidth={2.5} className="w-4 h-4 animate-in zoom-in duration-200" />
        ) : (
          <ClipboardIcon width={16} height={16} className="transition-colors duration-200" />
        )}
      </button>
      <Tooltip open={open || pasted} content={tooltipContent} anchorRef={anchorRef} prefer="top" />
    </div>
  );
}
