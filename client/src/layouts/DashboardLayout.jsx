/**
 * layouts/DashboardLayout.jsx
 * Authenticated app shell — sidebar, header, mobile bottom nav.
 */

import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserProfile } from "../context/UserProfileContext";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import authService from "../services/authService";
import { authKeys, userKeys } from "../services/queryKeys";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileBottomNav from "./MobileBottomNav";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUserProfile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationKey: authKeys.logout(),
    mutationFn: () => authService.logout(),
    onSuccess: async () => {
      queryClient.setQueryData(userKeys.profile(), null);
      queryClient.clear();
      showSuccessToast("Logged out successfully");
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      queryClient.setQueryData(userKeys.profile(), null);
      queryClient.clear();
      handleApiError(error);
      navigate("/login", { replace: true });
    },
  });

  const handleLogout = () => logoutMutation.mutate();

  return (
    <div className="min-h-screen bg-appBg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-col lg:pl-[240px]">
        <Header
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
          logoutLoading={logoutMutation.isPending}
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
