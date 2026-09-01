/**
 * layouts/AuthLayout.jsx
 * Split-panel layout for sign in, sign up, and password reset pages.
 */

import { Link, Outlet } from "react-router-dom";

const features = [
  "Track expenses in one place",
  "Secure JWT-based authentication",
  "Clean dashboard to get started",
];

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <aside className="relative hidden w-[45%] overflow-hidden bg-brand-900 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.25),transparent_55%)]" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-16">
          <Link to="/" className="mb-10 inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white shadow-lg">
              ET
            </span>
            <span className="text-xl font-semibold text-white">ExpenseTracker</span>
          </Link>

          <h1 className="max-w-md text-4xl font-bold leading-tight text-white">
            Manage your money with confidence
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-brand-100">
            Sign in or create an account to access your personal expense dashboard.
          </p>

          <ul className="mt-10 space-y-4">
            {features.map((item) => (
              <li key={item} className="flex items-center gap-3 text-brand-100">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600/30 text-xs text-brand-200">
                  ✓
                </span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 px-12 pb-8 text-xs text-brand-200/80 xl:px-16">
          © {new Date().getFullYear()} ExpenseTracker. All rights reserved.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 flex-col items-center justify-center bg-brand-50 px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
            ET
          </span>
          <span className="text-lg font-semibold text-brand-900">ExpenseTracker</span>
        </div>

        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
