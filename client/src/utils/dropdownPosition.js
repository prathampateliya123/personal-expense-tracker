const VIEWPORT_PAD = 8;
const PANEL_GAP = 6;

export function computeDropdownStyle(
  triggerRect,
  {
    menuWidth,
    menuHeight = 240,
    align = "left",
    matchWidth = false,
    gap = PANEL_GAP,
    pad = VIEWPORT_PAD,
    maxMenuWidth = 320,
    minMenuWidth = 0,
  } = {}
) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const triggerWidth = Math.max(0, triggerRect.width || 0);
  const rawWidth = Number(menuWidth) || 0;
  const floor = Number(minMenuWidth) > 0 ? Number(minMenuWidth) : 72;
  const maxAvailable = Math.max(
    floor,
    Math.min(Number(maxMenuWidth) || 320, vw - pad * 2)
  );

  const preferredWidth = Math.min(
    Math.max(floor, rawWidth, matchWidth ? triggerWidth : 0),
    maxAvailable
  );

  let left =
    align === "right" ? triggerRect.right - preferredWidth : triggerRect.left;
  left = Math.max(pad, Math.min(left, vw - preferredWidth - pad));

  const spaceBelow = vh - triggerRect.bottom - gap - pad;
  const spaceAbove = triggerRect.top - gap - pad;
  const minNeeded = 140;
  const placeAbove = spaceBelow < minNeeded && spaceAbove > spaceBelow;

  let top;
  let maxHeight;
  if (placeAbove) {
    maxHeight = Math.max(120, spaceAbove);
    top = Math.max(pad, triggerRect.top - gap - Math.min(menuHeight, maxHeight));
  } else {
    maxHeight = Math.max(120, Math.min(280, spaceBelow));
    top = triggerRect.bottom + gap;
  }

  return {
    position: "fixed",
    top,
    left,
    width: preferredWidth,
    minWidth: preferredWidth,
    maxWidth: maxAvailable,
    maxHeight,
  };
}
