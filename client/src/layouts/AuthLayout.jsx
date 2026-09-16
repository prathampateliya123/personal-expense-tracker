import { Link, Outlet } from "react-router-dom";
import BrandLogo from "../components/common/BrandLogo";

const features = [
  "Track every rupee in one place",
  "Bank-grade secure authentication",
  "Smart insights at a glance",
];

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen bg-appBg">
      <aside className="relative hidden w-[45%] overflow-hidden bg-primaryDark lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accentGreen/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-accentGold/10 blur-2xl" />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-16">
          <Link to="/" className="mb-10 inline-flex max-w-[260px]">
            <BrandLogo variant="full" size="full" />
          </Link>

          <h1 className="max-w-md font-pixel text-[1.15rem] leading-relaxed text-white sm:text-[1.35rem]">
            Your money, organized beautifully
          </h1>
          <p className="mt-4 max-w-md font-mono text-sm leading-relaxed text-white/75 sm:text-base">
            Take control of spending, savings, and goals — all from one clean
            dashboard.
          </p>

          <ul className="mt-10 space-y-4">
            {features.map((item) => (
              <li key={item} className="flex items-center gap-3 text-white/90">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-accentGreen text-xs font-bold text-primaryDark">
                  ✓
                </span>
                <span className="font-mono text-sm font-medium">{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-10 font-mono text-xs uppercase tracking-[0.2em] text-white/45">
            Plan • Track • Grow
          </p>
        </div>

        <p className="relative z-10 px-12 pb-8 font-mono text-xs text-white/40 xl:px-16">
          © {new Date().getFullYear()} Expense Tracker
        </p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center bg-surfaceLight px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <BrandLogo variant="mark" size="md" />
          <div>
            <p className="font-pixel text-[10px] leading-tight text-primaryDark">
              Expense Tracker
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary">
              Plan • Track • Grow
            </p>
          </div>
        </div>

        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
