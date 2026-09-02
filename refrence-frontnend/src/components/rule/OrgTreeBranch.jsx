import { Children, useLayoutEffect, useRef, useState } from "react";
import { ROOT_GROUP_THEME } from "../../utils/conditionGroupTheme";
import {
  getLocalBox,
  RULE_CANVAS_TRANSFORM_EVENT
} from "../../utils/domGeometry";

export default function OrgTreeBranch({
  parent,
  children,
  className = "",
  lineColor = ROOT_GROUP_THEME.line
}) {
  const wrapRef = useRef(null);
  const parentRef = useRef(null);
  const childRefs = useRef([]);
  const [paths, setPaths] = useState([]);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const childArray = Children.toArray(children);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const parentEl = parentRef.current;
    if (!wrap || !parentEl) return undefined;

    const redraw = () => {
      const parentBox = getLocalBox(wrap, parentEl);
      const startX = parentBox.left + parentBox.width / 2;
      const startY = parentBox.bottom;

      const nextPaths = childRefs.current
        .slice(0, childArray.length)
        .filter(Boolean)
        .map((el) => {
          const box = getLocalBox(wrap, el);
          const endX = box.left + box.width / 2;
          const endY = box.top;
          const dy = Math.max(48, endY - startY);
          const c1y = startY + dy * 0.45;
          const c2y = endY - dy * 0.45;
          return `M ${startX} ${startY} C ${startX} ${c1y}, ${endX} ${c2y}, ${endX} ${endY}`;
        });

      setPaths(nextPaths);
      setSize({
        width: Math.max(wrap.scrollWidth, wrap.clientWidth),
        height: Math.max(wrap.scrollHeight, wrap.clientHeight)
      });
    };

    const schedule = () => requestAnimationFrame(redraw);
    schedule();

    const observer = new ResizeObserver(schedule);
    observer.observe(wrap);
    observer.observe(parentEl);
    childRefs.current.slice(0, childArray.length).forEach((el) => {
      if (el) observer.observe(el);
    });

    window.addEventListener("resize", schedule);
    wrap.addEventListener(RULE_CANVAS_TRANSFORM_EVENT, schedule);
    document.addEventListener(RULE_CANVAS_TRANSFORM_EVENT, schedule);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      wrap.removeEventListener(RULE_CANVAS_TRANSFORM_EVENT, schedule);
      document.removeEventListener(RULE_CANVAS_TRANSFORM_EVENT, schedule);
    };
  }, [childArray.length, lineColor]);

  return (
    <div
      ref={wrapRef}
      className={`relative flex flex-col items-center ${className}`.trim()}
    >
      <div ref={parentRef} className="relative z-[1]">
        {parent}
      </div>

      {childArray.length > 0 ? (
        <>
          <svg
            className="pointer-events-none absolute left-0 top-0 z-0 overflow-visible"
            width={Math.max(size.width, 1)}
            height={Math.max(size.height, 1)}
            overflow="visible"
            aria-hidden
          >
            {paths.map((d, index) => (
              <path
                key={index}
                d={d}
                fill="none"
                stroke={lineColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          <ul className="relative z-[1] m-0 flex list-none items-start justify-center gap-4 pt-24 pl-0">
            {childArray.map((child, index) => (
              <li
                key={child.key ?? index}
                ref={(el) => {
                  childRefs.current[index] = el;
                }}
                className="flex flex-col items-center"
              >
                {child}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}