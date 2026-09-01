/**
 * layouts/DashboardLayout.jsx
 * Main authenticated layout with dark sidebar and content area.
 */

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { logoutUser } from "../redux/authSlice";

const navLinks = [{ to: "/dashboard", label: "Dashboard", end: true }];

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(result)) {
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-ink-950 shadow-sidebar">
        <div className="flex h-16 items-center gap-2.5 border-b border-white/5 px-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            ₹
          </span>
          <span className="text-base font-semibold tracking-tight text-white">
            ExpenseTracker
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-600/15 text-brand-300"
                    : "text-ink-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/5 p-4">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-accent-expense/90 transition hover:bg-accent-expense/10 disabled:opacity-60"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="ml-64 flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-surface-border bg-surface-card/80 px-8 backdrop-blur-md">
          <p className="text-sm text-ink-400">Welcome back</p>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 ring-2 ring-brand-200/50">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-ink-800">{user?.name}</p>
              <p className="text-xs text-ink-400">{user?.email}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
