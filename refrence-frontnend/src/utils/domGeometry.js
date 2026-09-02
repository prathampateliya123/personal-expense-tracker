export function getScaleToLocal(wrapEl) {
  if (!wrapEl) return { sx: 1, sy: 1 };
  const rect = wrapEl.getBoundingClientRect();
  const w = wrapEl.offsetWidth || wrapEl.clientWidth || 1;
  const h = wrapEl.offsetHeight || wrapEl.clientHeight || 1;
  return {
    sx: w ? rect.width / w : 1,
    sy: h ? rect.height / h : 1
  };
}

export function getLocalBox(wrapEl, el) {
  const wrapRect = wrapEl.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  const { sx, sy } = getScaleToLocal(wrapEl);
  const safeSx = sx || 1;
  const safeSy = sy || 1;
  return {
    left: (rect.left - wrapRect.left) / safeSx,
    top: (rect.top - wrapRect.top) / safeSy,
    width: rect.width / safeSx,
    height: rect.height / safeSy,
    right: (rect.right - wrapRect.left) / safeSx,
    bottom: (rect.bottom - wrapRect.top) / safeSy
  };
}

export const RULE_CANVAS_TRANSFORM_EVENT = "rule-canvas-transform";

export function emitRuleCanvasTransform(target) {
  const node = target instanceof Element ? target : document;
  node.dispatchEvent(
    new CustomEvent(RULE_CANVAS_TRANSFORM_EVENT, { bubbles: true })
  );
}