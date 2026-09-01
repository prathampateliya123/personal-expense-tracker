/**
 * layouts/AuthLayout.jsx
 * Split-panel layout for sign in, sign up, and password reset pages.
 */

import { Link, Outlet } from "react-router-dom";

const features = [
  "Track every rupee in one place",
  "Bank-grade secure authentication",
  "Smart insights at a glance",
];

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <aside className="relative hidden w-[45%] overflow-hidden bg-brand-gradient lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-brand-glow" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-brand-300/5 blur-2xl" />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-16">
          <Link to="/" className="mb-10 inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-lg font-bold text-white shadow-lg shadow-brand-900/30">
              ₹
            </span>
            <span className="text-xl font-semibold tracking-tight text-white">
              ExpenseTracker
            </span>
          </Link>

          <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight text-white">
            Your money, organized beautifully
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-brand-100/90">
            Take control of spending, savings, and goals — all from one clean
            dashboard.
          </p>

          <ul className="mt-10 space-y-4">
            {features.map((item) => (
              <li key={item} className="flex items-center gap-3 text-brand-50/90">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-semibold text-brand-200 backdrop-blur-sm">
                  ✓
                </span>
                <span className="text-sm font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 px-12 pb-8 text-xs text-brand-200/60 xl:px-16">
          © {new Date().getFullYear()} ExpenseTracker
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 flex-col items-center justify-center bg-surface px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-md shadow-brand-600/25">
            ₹
          </span>
          <span className="text-lg font-semibold tracking-tight text-ink-900">
            ExpenseTracker
          </span>
        </div>

        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
