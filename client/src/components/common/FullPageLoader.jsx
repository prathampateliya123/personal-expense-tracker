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

    <div className="relative z-10 flex w-full max-w-md flex-col items-center">
      <div className="fullpage-loader__orbit">
        <div className="fullpage-loader__ring" aria-hidden="true" />
        <div className="fullpage-loader__ring fullpage-loader__ring--inner" aria-hidden="true" />
        <div className="fullpage-loader__icon-wrap">
          <BrandLogo
            variant="icon"
            size="loader"
            className="fullpage-loader__icon"
          />
        </div>
      </div>

      <h1 className="fullpage-loader__title mt-8 text-center" aria-label="Expense Tracker">
        <span className="fullpage-loader__word fullpage-loader__word--expense">
          Expense
        </span>
        <span className="fullpage-loader__word fullpage-loader__word--tracker">
          Tracker
        </span>
      </h1>

      <div className="fullpage-loader__steps mt-5 flex items-center gap-2 font-mono text-xs text-white/70 sm:text-sm">
        {STEPS.map((step, index) => (
          <span key={step} className="inline-flex items-center gap-2">
            <span
              className="fullpage-loader__step"
              style={{ animationDelay: `${0.8 + index * 0.35}s` }}
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
