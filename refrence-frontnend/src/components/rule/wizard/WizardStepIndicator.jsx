import { WIZARD_STEPS } from "../../../utils/constants";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function StepCircle({
  step,
  displayNumber,
  active,
  done,
  canOpen,
  clickable,
  onStepClick
}) {
  return (
    <button
      type="button"
      disabled={!clickable && !active}
      onClick={() => {
        if (!clickable) return;
        onStepClick?.(step.id);
      }}
      className={`relative z-[1] flex h-8 w-8 shrink-0 aspect-square items-center justify-center !rounded-full text-[12px] font-semibold tabular-nums sm:h-9 sm:w-9 sm:text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 ${active
          ? "bg-[var(--brand-orange)] text-white shadow-[0_0_0_4px_rgba(246,143,61,0.2)] cursor-default"
          : done
            ? "bg-[var(--brand-orange)] text-white cursor-pointer hover:brightness-95"
            : canOpen
              ? "border border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] cursor-pointer hover:border-[var(--brand-orange)] hover:text-[var(--brand-orange)]"
              : "border border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] cursor-not-allowed opacity-55"
        }`}
      style={{
        borderRadius: "9999px",
        transition:
          "background-color 400ms ease, color 400ms ease, border-color 400ms ease, box-shadow 450ms ease, transform 450ms " +
          EASE +
          ", opacity 300ms ease",
        transform: active ? "scale(1.06)" : "scale(1)"
      }}
      aria-current={active ? "step" : undefined}
      aria-disabled={!canOpen || undefined}
      aria-label={`Step ${displayNumber}: ${step.label}${done ? ", completed" : active ? ", current" : canOpen ? "" : ", locked"
        }`}
      title={canOpen ? `Go to ${step.label}` : "Complete previous steps to unlock"}
    >
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: done ? 1 : 0,
          transform: done ? "scale(1)" : "scale(0.6)",
          transition: `opacity 280ms ease, transform 350ms ${EASE}`,
          transitionDelay: done ? "120ms" : "0ms"
        }}
        aria-hidden={!done}
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" aria-hidden>
          <path
            d="M3.5 8.2 6.6 11.2 12.5 4.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span
        style={{
          opacity: done ? 0 : 1,
          transform: done ? "scale(0.6)" : "scale(1)",
          transition: `opacity 220ms ease, transform 300ms ${EASE}`
        }}
      >
        {displayNumber}
      </span>
    </button>
  );
}

export default function WizardStepIndicator({
  currentStep = 1,
  className = "",
  maxReachableStep = 1,
  allComplete = false,
  hideTitle = false,
  layout = "vertical",
  steps = WIZARD_STEPS,
  onStepClick
}) {
  const stepList = Array.isArray(steps) && steps.length ? steps : WIZARD_STEPS;
  const reachable = allComplete
    ? Math.max(...stepList.map((step) => Number(step.id) || 0), 1)
    : Math.max(1, Number(maxReachableStep) || 1);

  const horizontal = layout === "horizontal";

  return (
    <nav
      className={`flex ${horizontal ? "w-full min-w-0" : "h-full flex-col"} ${className}`.trim()}
      aria-label="Rule creation progress"
    >
      {!hideTitle && !horizontal ? (
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-muted)]">
          Progress
        </p>
      ) : null}

      <ol
        className={
          horizontal
            ? "flex w-full min-w-0 items-start gap-0 overflow-x-auto overflow-y-visible overscroll-x-contain px-0.5 pt-2.5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "flex flex-1 flex-col justify-between"
        }
      >
        {stepList.map((step, index) => {
          const displayNumber = index + 1;
          const active = !allComplete && step.id === currentStep;
          const done = allComplete || step.id < currentStep;
          const upcoming = !active && !done;
          const isLast = index === stepList.length - 1;
          const connectorFilled = allComplete || step.id < currentStep;
          const canOpen = step.id <= reachable;
          const clickable = Boolean(onStepClick) && canOpen && !active;

          if (horizontal) {
            const lineReached = allComplete || step.id <= currentStep;
            const linePassed = allComplete || step.id < currentStep;

            return (
              <li
                key={step.id}
                className="flex min-w-[2.25rem] flex-1 flex-col items-center sm:min-w-0"
              >
                <div className="flex w-full items-center">
                  <span
                    className={`h-[2px] min-h-[2px] min-w-[6px] flex-1 shrink rounded-full ${index === 0
                        ? "bg-transparent"
                        : lineReached
                          ? "bg-[var(--brand-orange)]"
                          : "bg-[var(--border)]"
                      }`}
                    aria-hidden
                  />
                  <StepCircle
                    step={step}
                    displayNumber={displayNumber}
                    active={active}
                    done={done}
                    canOpen={canOpen}
                    clickable={clickable}
                    onStepClick={onStepClick}
                  />
                  <span
                    className={`h-[2px] min-h-[2px] min-w-[6px] flex-1 shrink rounded-full ${isLast
                        ? "bg-transparent"
                        : linePassed
                          ? "bg-[var(--brand-orange)]"
                          : "bg-[var(--border)]"
                      }`}
                    aria-hidden
                  />
                </div>
                <p
                  className={`mt-1.5 hidden w-full truncate px-0.5 text-center text-[10px] font-semibold leading-tight sm:block sm:text-[11px] ${active || done ? "text-[var(--ink)]" : "text-[var(--ink-muted)]"
                    }`}
                >
                  {step.label}
                </p>
              </li>
            );
          }

          return (
            <li key={step.id} className={`relative flex gap-3 ${isLast ? "" : "flex-1"}`}>
              <div className="flex w-9 shrink-0 flex-col items-center">
                <StepCircle
                  step={step}
                  displayNumber={displayNumber}
                  active={active}
                  done={done}
                  canOpen={canOpen}
                  clickable={clickable}
                  onStepClick={onStepClick}
                />

                {!isLast ? (
                  <span
                    className="relative mt-1.5 mb-1.5 w-[2px] min-h-[20px] flex-1 overflow-hidden rounded-full bg-[var(--border)]"
                    aria-hidden
                  >
                    <span
                      className="absolute inset-x-0 top-0 block w-full rounded-full bg-[var(--brand-orange)]"
                      style={{
                        height: "100%",
                        transformOrigin: "top center",
                        transform: connectorFilled ? "scaleY(1)" : "scaleY(0)",
                        transition: `transform 520ms ${EASE}`
                      }}
                    />
                  </span>
                ) : null}
              </div>

              <div className={`min-w-0 flex-1 pt-1 ${isLast ? "pb-0" : "pb-2"}`}>
                {canOpen && onStepClick ? (
                  <button
                    type="button"
                    disabled={active}
                    onClick={() => {
                      if (active) return;
                      onStepClick?.(step.id);
                    }}
                    className={`block w-full rounded-[6px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-1 ${active ? "cursor-default" : "cursor-pointer"
                      }`}
                  >
                    <p
                      className={`text-[14px] font-semibold leading-snug ${active || done ? "text-[var(--ink)]" : "text-[var(--ink-muted)]"
                        }`}
                      style={{ transition: "color 400ms ease" }}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`mt-0.5 text-[12px] leading-snug ${upcoming ? "text-[var(--ink-subtle)]" : "text-[var(--ink-muted)]"
                        }`}
                      style={{ transition: "color 400ms ease" }}
                    >
                      {step.description}
                    </p>
                  </button>
                ) : (
                  <>
                    <p
                      className={`text-[14px] font-semibold leading-snug ${active || done ? "text-[var(--ink)]" : "text-[var(--ink-muted)]"
                        }`}
                      style={{ transition: "color 400ms ease" }}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`mt-0.5 text-[12px] leading-snug ${upcoming ? "text-[var(--ink-subtle)]" : "text-[var(--ink-muted)]"
                        }`}
                      style={{ transition: "color 400ms ease" }}
                    >
                      {step.description}
                    </p>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}