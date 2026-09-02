/**
 * layouts/DashboardLayout.jsx
 * Authenticated app shell — light sidebar, header, mobile bottom nav.
 */

import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { logoutUser } from "../redux/slices/authSlice";
import Sidebar from "../components/layout/Sidebar";
import DashboardHeader from "../components/layout/DashboardHeader";
import MobileBottomNav from "../components/layout/MobileBottomNav";

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-appBg">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-col lg:pl-[240px]">
        <DashboardHeader
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
          logoutLoading={loading}
        />

        <main className="dashboard-content w-full min-w-0 flex-1 bg-surfaceLight px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
