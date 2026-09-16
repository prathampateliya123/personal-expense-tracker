import { Link, Outlet } from "react-router-dom";

const features = [
  "Track every rupee in one place",
  "Bank-grade secure authentication",
  "Smart insights at a glance",
];

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen bg-appBg">
      <aside className="relative hidden w-[45%] overflow-hidden gradient-green-card lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/5 blur-2xl" />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-16">
          <Link to="/" className="mb-10 inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-accentGreen bg-accentGreen text-lg font-bold text-primaryDark">
              ₹
            </span>
            <span className="font-pixel text-[11px] leading-tight text-accentGreen">
              EXPENSE
            </span>
          </Link>

          <h1 className="max-w-md font-pixel text-[1.35rem] leading-relaxed text-white sm:text-[1.5rem]">
            Your money, organized beautifully
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
            Take control of spending, savings, and goals — all from one clean
            dashboard.
          </p>

          <ul className="mt-10 space-y-4">
            {features.map((item) => (
              <li key={item} className="flex items-center gap-3 text-white/90">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-accentGreen text-xs font-bold text-primaryDark">
                  ✓
                </span>
                <span className="text-sm font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 px-12 pb-8 text-xs text-white/50 xl:px-16">
          © {new Date().getFullYear()} ExpenseTracker
        </p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center bg-surfaceLight px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-primaryDark bg-accentGreen text-sm font-bold text-primaryDark">
            ₹
          </span>
          <span className="font-pixel text-[11px] leading-tight text-primaryDark">
            EXPENSE
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
