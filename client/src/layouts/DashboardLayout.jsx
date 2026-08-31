/**
 * layouts/DashboardLayout.jsx
 * Main authenticated layout with sidebar navigation, topbar, and content area.
 * Uses React Router's Outlet to render nested page components.
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
  { to: "/dashboard/reports", label: "Reports" },
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-white shadow-md">
        <div className="flex h-16 items-center border-b border-gray-100 px-6">
          <span className="text-lg font-bold text-indigo-600">
            ExpenseTracker
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          <button
            onClick={handleLogout}
            disabled={loading}
            className="mt-2 w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main area */}
      <div className="ml-64 flex flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-end gap-4 border-b border-gray-100 bg-white px-8 shadow-sm">
          <NotificationBell />
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
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
            <span className="text-sm font-medium text-gray-700">
              {user?.name}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
