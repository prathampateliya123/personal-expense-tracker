/**
 * layouts/DashboardLayout.jsx
 * Authenticated app shell — reference-style viewport height + scroll containment.
 */

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sidebarOpen]);

  return (
    <div className="app-shell-height flex h-screen overflow-hidden bg-appBg text-textPrimary antialiased">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-shell-height flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
          logoutLoading={logoutMutation.isPending}
        />

        <main className="dashboard-main-scroll relative flex min-h-0 flex-grow flex-col overflow-x-hidden overflow-y-auto overscroll-contain bg-surfaceLight px-3 pt-3 pb-[max(5.5rem,env(safe-area-inset-bottom))] sm:px-5 sm:pt-4 lg:px-6 lg:pt-5 lg:pb-5">
          <div className="page-shell w-full min-w-0 max-w-full">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
