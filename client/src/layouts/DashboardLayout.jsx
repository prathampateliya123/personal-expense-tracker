/**
 * layouts/DashboardLayout.jsx
 * Main authenticated layout with sidebar navigation, topbar, and content area.
 */

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { logoutUser } from "../redux/authSlice";
import NotificationBell from "../components/NotificationBell";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", end: true },
  { to: "/expenses", label: "Expenses" },
  { to: "/income", label: "Income" },
  { to: "/budget", label: "Budget" },
  { to: "/goals", label: "Goals" },
  { to: "/wallets", label: "Wallets" },
  { to: "/subscriptions", label: "Subscriptions" },
  { to: "/simulator", label: "Simulator" },
  { to: "/investments", label: "Investments" },
  { to: "/reports", label: "Reports" },
  { to: "/timeline", label: "Timeline" },
  { to: "/trips", label: "Trips" },
  { to: "/dashboard/settings", label: "Settings" },
];

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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — SpendWise dark green nav */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-navBar shadow-cardDark">
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <span className="text-lg font-bold tracking-heading text-white">
            Spend<span className="text-secondaryLight">Wise</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block rounded-card px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-accent/20 text-secondaryLight"
                    : "text-textMuted hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          <button
            onClick={handleLogout}
            disabled={loading}
            className="mt-2 w-full rounded-card px-4 py-2.5 text-left text-sm font-medium text-textMuted transition hover:bg-white/5 hover:text-white disabled:opacity-60"
          >
            Logout
          </button>
        </nav>
      </aside>

      <div className="ml-64 flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-end gap-4 border-b border-border bg-surface/90 px-8 backdrop-blur-sm">
          <NotificationBell />
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
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
            <span className="text-sm font-medium text-textPrimary">
              {user?.name}
            </span>
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
