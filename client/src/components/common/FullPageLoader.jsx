import BrandLogo from "./BrandLogo";

const STEPS = ["Plan", "Track", "Grow"];

const FullPageLoader = ({ message = "Loading your money hub..." }) => (
  <div
    className="fullpage-loader fixed inset-0 z-[9999] flex min-h-screen flex-col items-center justify-center overflow-hidden bg-primaryDark px-6"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div className="fullpage-loader__glow" aria-hidden="true" />
    <div className="fullpage-loader__spark fullpage-loader__spark--1" aria-hidden="true" />
    <div className="fullpage-loader__spark fullpage-loader__spark--2" aria-hidden="true" />
    <div className="fullpage-loader__spark fullpage-loader__spark--3" aria-hidden="true" />

    <div className="relative z-10 flex flex-col items-center">
      <div className="fullpage-loader__orbit">
        <div className="fullpage-loader__ring" aria-hidden="true" />
        <div className="fullpage-loader__logo-wrap">
          <BrandLogo variant="full" size="full" className="fullpage-loader__logo" />
        </div>
      </div>

      <p className="mt-8 font-pixel text-[10px] uppercase tracking-[0.18em] text-accentGreen sm:text-[11px]">
        Expense Tracker
      </p>

      <div className="fullpage-loader__steps mt-4 flex items-center gap-2 font-mono text-xs text-white/70 sm:text-sm">
        {STEPS.map((step, index) => (
          <span key={step} className="inline-flex items-center gap-2">
            <span
              className="fullpage-loader__step"
              style={{ animationDelay: `${index * 0.35}s` }}
            >
              {step}
            </span>
            {index < STEPS.length - 1 ? (
              <span className="text-accentGreen/80" aria-hidden="true">
                •
              </span>
            ) : null}
          </span>
        ))}
      </div>

      <div className="fullpage-loader__bar mt-8" aria-hidden="true">
        <span className="fullpage-loader__bar-fill" />
      </div>

      <p className="mt-4 font-mono text-xs text-white/50">{message}</p>
    </div>
  </div>
);

export default FullPageLoader;
