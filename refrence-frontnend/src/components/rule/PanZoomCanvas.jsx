import { APPLE_PLATFORM_REGEX } from "../../utils/constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { LocateIcon } from "../ui/Icons";
import { emitRuleCanvasTransform } from "../../utils/domGeometry";

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.1;
const FOCUS_DURATION_MS = 580;
const PAN_EDGE_PAD = 112;
const ZOOM_HINT_MS = 1800;
const LOGIC_GROUP_SELECTOR = '[data-canvas-focus="rule-if"]';

function getZoomHintLabel() {
  if (typeof navigator === "undefined") return "Ctrl + scroll to zoom";
  const isMac = APPLE_PLATFORM_REGEX.test(navigator.platform || navigator.userAgent || "");
  return isMac ? "⌘ + scroll to zoom" : "Ctrl + scroll to zoom";
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function snapZoom(zoom, minZoom = MIN_ZOOM, maxZoom = MAX_ZOOM) {
  const z = clamp(Number(zoom) || 1, minZoom, maxZoom);
  const rounded = Math.round(z * 100) / 100;
  if (Math.abs(rounded - 1) < 0.005) return 1;
  return rounded;
}

function snapPan(x, y) {
  const dpr =
    typeof window !== "undefined" && Number(window.devicePixelRatio) > 0
      ? window.devicePixelRatio
      : 1;
  return {
    x: Math.round(Number(x) * dpr) / dpr,
    y: Math.round(Number(y) * dpr) / dpr
  };
}

function snapTransform(x, y, zoom, minZoom, maxZoom) {
  const pan = snapPan(x, y);
  return { x: pan.x, y: pan.y, zoom: snapZoom(zoom, minZoom, maxZoom) };
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function isInteractiveTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      'button, a, input, select, textarea, label, [role="button"], [role="listbox"], [role="option"], [role="combobox"], [contenteditable="true"], .no-canvas-pan'
    )
  );
}

function clampPan(x, y, zoom, vw, vh, cw, ch, pad = PAN_EDGE_PAD) {
  if (!vw || !vh || !cw || !ch) {
    return { x, y, zoom };
  }

  const sw = cw * zoom;
  const sh = ch * zoom;

  let minX = vw - sw - pad;
  let maxX = pad;
  if (minX > maxX) {
    const mid = (vw - sw) / 2;
    const slack = Math.min(pad * 0.4, 48);
    minX = mid - slack;
    maxX = mid + slack;
  }

  let minY = vh - sh - pad;
  let maxY = pad;
  if (minY > maxY) {
    const mid = (vh - sh) / 2;
    const slack = Math.min(pad * 0.4, 48);
    minY = mid - slack;
    maxY = mid + slack;
  }

  return {
    x: clamp(x, minX, maxX),
    y: clamp(y, minY, maxY),
    zoom
  };
}

export default function PanZoomCanvas({
  children,
  className = "",
  minZoom = MIN_ZOOM,
  maxZoom = MAX_ZOOM,
  wheelZoomMode = "scroll"
}) {
  const viewportRef = useRef(null);
  const contentRef = useRef(null);
  const [transform, setTransform] = useState({ x: 48, y: 48, zoom: 1 });
  const transformRef = useRef(transform);
  const spaceDownRef = useRef(false);
  const panRef = useRef(null);
  const focusAnimRef = useRef(null);
  const contentSizeRef = useRef({ w: 0, h: 0 });
  const elseIfCycleRef = useRef(0);
  const thenCycleRef = useRef(0);
  const zoomHintTimerRef = useRef(null);
  const locateBtnRef = useRef(null);
  const [zoomHint, setZoomHint] = useState("");

  const cancelFocusAnim = useCallback(() => {
    if (focusAnimRef.current != null) {
      cancelAnimationFrame(focusAnimRef.current);
      focusAnimRef.current = null;
    }
  }, []);

  const measureContent = useCallback(() => {
    const el = contentRef.current;
    if (!el) return contentSizeRef.current;
    const w = Math.max(el.offsetWidth, el.scrollWidth, 1);
    const h = Math.max(el.offsetHeight, el.scrollHeight, 1);
    contentSizeRef.current = { w, h };
    return contentSizeRef.current;
  }, []);

  const applyTransform = useCallback((next) => {
    const viewport = viewportRef.current;
    const { w, h } = measureContent();
    const zoom = snapZoom(next.zoom, minZoom, maxZoom);
    if (!viewport) {
      setTransform(snapTransform(next.x, next.y, zoom, minZoom, maxZoom));
      return;
    }
    const rect = viewport.getBoundingClientRect();
    const clamped = clampPan(next.x, next.y, zoom, rect.width, rect.height, w, h);
    setTransform(snapTransform(clamped.x, clamped.y, clamped.zoom, minZoom, maxZoom));
  }, [measureContent, minZoom, maxZoom]);

  useEffect(() => {
    transformRef.current = transform;
    const id = requestAnimationFrame(() => {
      emitRuleCanvasTransform(viewportRef.current || document);
    });
    return () => cancelAnimationFrame(id);
  }, [transform]);

  useEffect(() => {
    const content = contentRef.current;
    const viewport = viewportRef.current;
    if (!content || !viewport) return undefined;

    const reclamp = () => {
      measureContent();
      const { x, y, zoom } = transformRef.current;
      applyTransform({ x, y, zoom });
    };

    const ro = new ResizeObserver(() => {
      reclamp();
    });
    ro.observe(content);
    ro.observe(viewport);

    const id = requestAnimationFrame(reclamp);

    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, [applyTransform, measureContent]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === "Space" && !e.repeat) {
        const tag = document.activeElement?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        spaceDownRef.current = true;
        if (viewportRef.current) viewportRef.current.dataset.space = "1";
      }
    };
    const onKeyUp = (e) => {
      if (e.code === "Space") {
        spaceDownRef.current = false;
        if (viewportRef.current) delete viewportRef.current.dataset.space;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const zoomAt = useCallback(
    (clientX, clientY, nextZoom) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      const { x, y, zoom } = transformRef.current;
      const z = clamp(nextZoom, minZoom, maxZoom);
      if (z === zoom) return;

      const px = clientX - rect.left;
      const py = clientY - rect.top;
      const worldX = (px - x) / zoom;
      const worldY = (py - y) / zoom;
      applyTransform({
        zoom: z,
        x: px - worldX * z,
        y: py - worldY * z
      });
    },
    [minZoom, maxZoom, applyTransform]
  );

  const hideZoomHint = useCallback(() => {
    if (zoomHintTimerRef.current != null) {
      window.clearTimeout(zoomHintTimerRef.current);
      zoomHintTimerRef.current = null;
    }
    setZoomHint("");
  }, []);

  const showZoomHint = useCallback(() => {
    setZoomHint(getZoomHintLabel());
    if (zoomHintTimerRef.current != null) window.clearTimeout(zoomHintTimerRef.current);
    zoomHintTimerRef.current = window.setTimeout(() => {
      zoomHintTimerRef.current = null;
      setZoomHint("");
    }, ZOOM_HINT_MS);
  }, []);

  const onWheel = useCallback(
    (e) => {
      const ctrlZoom = wheelZoomMode === "ctrl";
      if (ctrlZoom && !e.ctrlKey && !e.metaKey) {
        showZoomHint();
        return;
      }
      hideZoomHint();
      e.preventDefault();
      cancelFocusAnim();
      const { zoom } = transformRef.current;
      const direction = e.deltaY > 0 ? -1 : 1;
      zoomAt(e.clientX, e.clientY, zoom + direction * 0.08 * zoom);
    },
    [wheelZoomMode, zoomAt, cancelFocusAnim, showZoomHint, hideZoomHint]
  );

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const endPan = useCallback(() => {
    panRef.current = null;
    if (viewportRef.current) delete viewportRef.current.dataset.panning;
  }, []);

  useEffect(() => () => cancelFocusAnim(), [cancelFocusAnim]);
  useEffect(
    () => () => {
      if (zoomHintTimerRef.current != null) window.clearTimeout(zoomHintTimerRef.current);
    },
    []
  );

  useEffect(() => {
    const onMove = (e) => {
      const pan = panRef.current;
      if (!pan) return;
      const dx = e.clientX - pan.lastX;
      const dy = e.clientY - pan.lastY;
      pan.lastX = e.clientX;
      pan.lastY = e.clientY;
      const prev = transformRef.current;
      applyTransform({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      });
    };
    const onUp = () => endPan();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [endPan, applyTransform]);

  const onPointerDown = (e) => {
    if (e.button === 1 || spaceDownRef.current) {
      e.preventDefault();
      cancelFocusAnim();
      panRef.current = { lastX: e.clientX, lastY: e.clientY };
      if (viewportRef.current) viewportRef.current.dataset.panning = "1";
      return;
    }
    if (e.button !== 0) return;
    if (isInteractiveTarget(e.target)) return;
    cancelFocusAnim();
    panRef.current = { lastX: e.clientX, lastY: e.clientY };
    if (viewportRef.current) viewportRef.current.dataset.panning = "1";
  };

  const zoomBy = (delta) => {
    cancelFocusAnim();
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, transform.zoom + delta);
  };

  const resetView = () => {
    cancelFocusAnim();
    applyTransform({ x: 40, y: 40, zoom: 1 });
  };

  const focusOnElement = useCallback(
    (target) => {
      const viewport = viewportRef.current;
      if (!viewport || !target) return;

      measureContent();
      const vRect = viewport.getBoundingClientRect();
      const tRect = target.getBoundingClientRect();
      const { x, y, zoom } = transformRef.current;
      const targetCenterX = tRect.left + tRect.width / 2;
      const targetCenterY = tRect.top + tRect.height / 2;
      const viewCenterX = vRect.left + vRect.width / 2;
      const viewCenterY = vRect.top + vRect.height / 2;

      const fromX = x;
      const fromY = y;
      const rawToX = x + (viewCenterX - targetCenterX);
      const rawToY = y + (viewCenterY - targetCenterY);
      const { w, h } = contentSizeRef.current;
      const clamped = clampPan(
        rawToX,
        rawToY,
        zoom,
        vRect.width,
        vRect.height,
        w,
        h
      );
      const toX = clamped.x;
      const toY = clamped.y;
      const dx = toX - fromX;
      const dy = toY - fromY;

      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;

      cancelFocusAnim();
      const start = performance.now();

      const tick = (now) => {
        const t = Math.min(1, (now - start) / FOCUS_DURATION_MS);
        const e = easeOutCubic(t);
        applyTransform({
          zoom,
          x: fromX + dx * e,
          y: fromY + dy * e
        });
        if (t < 1) {
          focusAnimRef.current = requestAnimationFrame(tick);
        } else {
          focusAnimRef.current = null;
        }
      };

      focusAnimRef.current = requestAnimationFrame(tick);
    },
    [cancelFocusAnim, applyTransform, measureContent]
  );

  const focusOnSelector = useCallback(
    (selector) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const target = viewport.querySelector(selector);
      focusOnElement(target);
    },
    [focusOnElement]
  );

  const focusCycle = useCallback(
    (selector, indexRef) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const nodes = viewport.querySelectorAll(selector);
      if (!nodes.length) return;
      const i = indexRef.current % nodes.length;
      focusOnElement(nodes[i]);
      indexRef.current = (i + 1) % nodes.length;
    },
    [focusOnElement]
  );

  const focusIf = () => {
    elseIfCycleRef.current = 0;
    thenCycleRef.current = 0;
    focusOnSelector(LOGIC_GROUP_SELECTOR);
  };

  const focusElseIf = () => {
    focusCycle('[data-canvas-focus="rule-else-if"]', elseIfCycleRef);
  };

  const focusElse = () => {
    focusOnSelector('[data-canvas-focus="rule-else"]');
  };

  const focusThen = () => {
    focusCycle('[data-canvas-focus="rule-then"]', thenCycleRef);
  };

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    let tries = 0;
    let lastW = 0;
    let stable = 0;

    const clickLocate = () => {
      if (cancelled) return;
      measureContent();
      const viewport = viewportRef.current;
      const btn = locateBtnRef.current;
      const target = viewport?.querySelector(LOGIC_GROUP_SELECTOR);
      const vRect = viewport?.getBoundingClientRect();
      const tRect = target?.getBoundingClientRect();
      const { w, h } = contentSizeRef.current;
      const ready =
        Boolean(btn) &&
        Boolean(target) &&
        (vRect?.width || 0) > 40 &&
        (vRect?.height || 0) > 40 &&
        (tRect?.width || 0) > 1 &&
        w > 40 &&
        h > 40;

      if (ready && w === lastW) stable += 1;
      else stable = 0;
      lastW = w;

      if (ready && stable >= 2) {
        btn.click();
        return;
      }

      tries += 1;
      if (tries < 80) timer = window.setTimeout(clickLocate, 50);
    };

    timer = window.setTimeout(clickLocate, 80);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [measureContent]);

  const zoomPercent = Math.round(transform.zoom * 100);

  const navBtnClass =
    "inline-flex h-7 items-center justify-center rounded-[6px] px-2 text-[11px] font-semibold text-[var(--ink)] hover:bg-[var(--canvas)] hover:text-[var(--brand-orange)] cursor-pointer sm:h-8 sm:px-2.5 sm:text-[12px]";

  return (
    <div
      className={`relative isolate min-h-0 flex-1 overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--canvas)] ${className}`.trim()}
    >
      <div
        ref={viewportRef}
        className="absolute inset-0 cursor-grab touch-none select-none data-[panning]:cursor-grabbing data-[space]:cursor-grab"
        onPointerDown={onPointerDown}
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(17,24,39,0.12) 1px, transparent 1px)",
          backgroundSize: `${18 * transform.zoom}px ${18 * transform.zoom}px`,
          backgroundPosition: `${transform.x}px ${transform.y}px`
        }}
      >
        <div
          className="origin-top-left"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
            transformOrigin: "0 0"
          }}
        >
          <div
            ref={contentRef}
            className="inline-block w-max max-w-none overflow-visible p-2 sm:p-6 lg:p-12 [text-rendering:geometricPrecision] [&_svg]:overflow-visible [&_svg]:[shape-rendering:geometricPrecision]"
          >
            {children}
          </div>
        </div>
      </div>

      {zoomHint ? (
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/45 px-4"
          role="status"
          aria-live="polite"
        >
          <p className="rounded-[10px] border border-white/15 bg-[var(--surface)] px-3.5 py-2 text-[13px] font-semibold text-[var(--ink)] shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
            {zoomHint}
          </p>
        </div>
      ) : null}

      <div className="pointer-events-none absolute bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-2 right-2 z-10 flex flex-wrap items-end justify-between gap-2 sm:bottom-3 sm:left-3 sm:right-3">
        <div className="pointer-events-auto flex items-center gap-0.5 rounded-[7px] border border-[var(--border)] bg-[var(--surface)] p-0.5 shadow-sm sm:gap-1 sm:p-1">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] text-[16px] font-semibold text-[var(--ink)] hover:bg-[var(--canvas)] cursor-pointer"
            onClick={() => zoomBy(-ZOOM_STEP)}
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            className="min-w-[44px] rounded-[6px] px-1 py-1 text-[11px] font-semibold tabular-nums text-[var(--ink)] hover:bg-[var(--canvas)] cursor-pointer sm:min-w-[52px] sm:px-1.5 sm:text-[12px]"
            onClick={resetView}
            title="Reset view"
          >
            {zoomPercent}%
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] text-[16px] font-semibold text-[var(--ink)] hover:bg-[var(--canvas)] cursor-pointer"
            onClick={() => zoomBy(ZOOM_STEP)}
            aria-label="Zoom in"
          >
            +
          </button>
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-1.5 sm:gap-2">
          <button
            ref={locateBtnRef}
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[7px] border border-[var(--border)] bg-[var(--surface)] text-[var(--brand-orange)] shadow-sm hover:bg-[var(--canvas)] cursor-pointer sm:h-9 sm:w-9"
            onClick={() => focusOnSelector(LOGIC_GROUP_SELECTOR)}
            aria-label="Go to Logic Group"
            title="Go to Logic Group"
          >
            <LocateIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden />
          </button>
          <div className="flex max-w-[min(100%,18rem)] flex-wrap items-center justify-end gap-0.5 rounded-[7px] border border-[var(--border)] bg-[var(--surface)] p-0.5 shadow-sm sm:max-w-none sm:gap-1 sm:p-1">
            <button
              type="button"
              className={navBtnClass}
              onClick={focusIf}
              title="Go to If logic group"
              aria-label="Go to If"
            >
              If
            </button>
            <button
              type="button"
              className={navBtnClass}
              onClick={focusElseIf}
              title="Cycle Else if blocks"
              aria-label="Go to Else if"
            >
              Else if
            </button>
            <button
              type="button"
              className={navBtnClass}
              onClick={focusElse}
              title="Go to Else block"
              aria-label="Go to Else"
            >
              Else
            </button>
            <button
              type="button"
              className={navBtnClass}
              onClick={focusThen}
              title="Cycle Then actions"
              aria-label="Go to Then"
            >
              Then
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}