import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DASHBOARD_SECTIONS } from "../../utils/dashboard";

function PeriodToggle({ periods, activePeriod, onPeriodChange }) {
  const tablistRef = useRef(null);
  const buttonRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });

  const updateIndicator = useCallback(() => {
    const tablist = tablistRef.current;
    const activeButton = buttonRefs.current[activePeriod];
    if (!tablist || !activeButton) return;

    const tablistRect = tablist.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    setIndicator({
      left: buttonRect.left - tablistRect.left + tablist.scrollLeft,
      width: buttonRect.width,
      opacity: 1
    });
  }, [activePeriod]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, periods]);

  useEffect(() => {
    const tablist = tablistRef.current;
    if (!tablist) return undefined;

    const handleReposition = () => updateIndicator();
    const resizeObserver = new ResizeObserver(handleReposition);

    resizeObserver.observe(tablist);
    tablist.addEventListener("scroll", handleReposition, { passive: true });
    window.addEventListener("resize", handleReposition);

    return () => {
      resizeObserver.disconnect();
      tablist.removeEventListener("scroll", handleReposition);
      window.removeEventListener("resize", handleReposition);
    };
  }, [updateIndicator]);

  return (
    <div
      ref={tablistRef}
      role="tablist"
      aria-label="Comparison period"
      className="dashboard-tabs-scroll relative flex w-full items-center gap-1 overflow-x-auto rounded-[10px] bg-[var(--canvas)] p-1 ring-1 ring-[var(--border)] lg:w-auto lg:flex-none"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1 bottom-1 rounded-[7px] bg-[var(--brand-orange)] shadow-[0_1px_2px_rgba(224,120,40,0.35)] transition-[left,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{
          left: indicator.left,
          width: indicator.width,
          opacity: indicator.opacity
        }}
      />

      {periods.map((tab) => {
        const active = activePeriod === tab.id;
        return (
          <button
            key={tab.id}
            ref={(node) => {
              if (node) buttonRefs.current[tab.id] = node;
              else delete buttonRefs.current[tab.id];
            }}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onPeriodChange(tab.id)}
            className={`relative z-[1] shrink-0 rounded-[7px] px-3 py-2 text-[12px] font-semibold tracking-[-0.01em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]/35 sm:px-3.5 sm:text-[12.5px] ${
              active
                ? "text-white"
                : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default function DashboardTabs({
  periods,
  activePeriod,
  onPeriodChange,
  activeSection,
  onSectionChange,
  overlayProfit,
  onOverlayProfitChange,
  marginPct,
  onMarginPctChange
}) {
  return (
    <div className="mb-4 space-y-3 sm:mb-6">
      <div className="flex flex-col gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-[0_1px_2px_rgba(26,29,35,0.04)] sm:rounded-[12px] sm:p-3.5">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-stretch lg:justify-between lg:gap-3">
          <PeriodToggle
            periods={periods}
            activePeriod={activePeriod}
            onPeriodChange={onPeriodChange}
          />

          <div
            className={`flex w-full flex-row flex-wrap items-center gap-x-2 gap-y-1 rounded-[10px] border px-3 py-2 text-[12px] transition-colors sm:flex-nowrap sm:text-[12.5px] lg:w-auto lg:flex-none lg:shrink-0 ${
              overlayProfit
                ? "border-[var(--brand-orange)]/35 bg-[var(--brand-orange-soft)] text-[var(--ink)]"
                : "border-[var(--border)] bg-[var(--canvas)] text-[var(--ink-muted)]"
            }`}
          >
            <label className="flex min-w-0 shrink-0 cursor-pointer items-center gap-2 font-medium">
              <input
                type="checkbox"
                checked={overlayProfit}
                onChange={(e) => onOverlayProfitChange(e.target.checked)}
                className="size-3.5 shrink-0 rounded-[4px] border-[var(--border-strong)] text-[var(--brand-orange)] focus:ring-[var(--brand-orange)]/25"
              />
              <span className="whitespace-nowrap leading-none">Overlay est. profit at</span>
            </label>
            <input
              type="number"
              value={marginPct}
              min={1}
              max={95}
              disabled={!overlayProfit}
              onChange={(e) => {
                const next = Number(e.target.value);
                onMarginPctChange(Number.isFinite(next) ? next : marginPct);
              }}
              onBlur={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next) && next >= 1 && next <= 95) {
                  onMarginPctChange(next);
                }
              }}
              className="w-[52px] shrink-0 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-1.5 py-1 text-center text-[12px] font-semibold text-[var(--ink)] focus:border-[var(--brand-orange)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-[12.5px]"
            />
            <span className="shrink-0 font-medium whitespace-nowrap">% margin</span>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Report section"
          className="dashboard-tabs-scroll -mx-1 flex items-center gap-0.5 overflow-x-auto border-t border-[var(--border)] px-1 pt-2"
        >
          {DASHBOARD_SECTIONS.map((section) => {
            const active = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSectionChange(section.id)}
                className={`relative shrink-0 whitespace-nowrap px-3 py-2 text-[12.5px] font-semibold tracking-[-0.01em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]/35 focus-visible:ring-offset-2 sm:px-3.5 sm:py-2.5 sm:text-[13px] ${
                  active
                    ? "text-[var(--brand-orange-strong)]"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                }`}
              >
                {section.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-2 bottom-0 h-[2.5px] rounded-full transition-all duration-200 ${
                    active ? "bg-[var(--brand-orange)] opacity-100" : "bg-transparent opacity-0"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
