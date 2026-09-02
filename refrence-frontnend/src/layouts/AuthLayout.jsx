import { Link } from "react-router-dom";

export default function AuthLayout({ children, headerRight = null, brandHref = "/" }) {
  const brandIsLink = brandHref !== null && brandHref !== false;
  const brandContent = (
    <span className="inline-flex items-center gap-2 min-w-0">
      <span className="truncate">Amazon Analysis SaaS</span>
    </span>
  );
  const brand = brandIsLink ? (
    <Link
      to={typeof brandHref === "string" ? brandHref : "/"}
      className="min-w-0 text-[var(--ink)] text-[13px] sm:text-[17px] font-semibold tracking-tight hover:opacity-80 transition-opacity"
    >
      {brandContent}
    </Link>
  ) : (
    <div className="min-w-0 text-[var(--ink)] text-[13px] sm:text-[17px] font-semibold tracking-tight">
      {brandContent}
    </div>
  );

  return (
    <div className="min-h-screen min-h-[100dvh] overflow-x-hidden bg-[var(--canvas)] font-sans relative flex flex-col text-[var(--ink)]">
      <header className="w-full h-[calc(52px+env(safe-area-inset-top))] sm:h-[calc(64px+env(safe-area-inset-top))] flex items-center justify-between gap-2 sm:gap-3 px-4 pt-[env(safe-area-inset-top)] sm:px-6 lg:px-8 relative z-20 shrink-0 bg-[var(--header-bg)] border-b border-[var(--border)]">
        <div className="min-w-0 flex-1">{brand}</div>
        <div className="flex h-full shrink-0 items-center justify-end gap-1.5 sm:gap-2 text-[11px] sm:text-[13px] leading-none">
          {headerRight}
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 w-full flex-1">
        <div className="w-full min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
          <div className="flex min-h-full w-full items-center justify-center px-4 py-6 sm:px-6 sm:py-8 md:px-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="w-full max-w-[520px]">
              <div className="rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-4 py-5 shadow-[0_16px_48px_rgba(17,24,39,0.08)] sm:px-8 sm:py-9 md:px-10">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
