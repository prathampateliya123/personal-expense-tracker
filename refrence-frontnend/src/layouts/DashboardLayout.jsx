import { useEffect, useState } from "react";
import { Outlet, useMatch } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useStore } from "../context/StoreContext";

export default function DashboardLayout({ children, flushBottom: flushBottomProp }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { ensureLoaded, selectedStore } = useStore();
  const createRuleMatch = useMatch({ path: "/rule-builder/create", end: true });
  const editRuleMatch = useMatch({ path: "/rule-builder/edit/:ruleId", end: true });
  const detailsRuleMatch = useMatch({ path: "/rule-builder/details/:ruleId", end: true });
  const isRuleBuilderFormRoute = Boolean(createRuleMatch || editRuleMatch || detailsRuleMatch);
  const flushBottom = flushBottomProp ?? isRuleBuilderFormRoute;
  const isSyncing = selectedStore?.sync_per != null && selectedStore.sync_per < 100;

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  useEffect(() => {
    if (!isSidebarOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isSidebarOpen]);

  return (
    <div className="app-shell-height h-screen bg-[var(--canvas)] text-[var(--ink)] flex overflow-hidden antialiased">
      <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col app-shell-height h-screen overflow-hidden min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main
          className={`relative flex min-h-0 flex-grow flex-col bg-[var(--canvas)] ${
             isSyncing
              ? "overflow-hidden px-3 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5 sm:pt-4 lg:px-6 lg:pt-5 lg:pb-5"
              : flushBottom
                ? "overflow-hidden px-0 pb-0 pt-0 sm:px-0 lg:pl-6 lg:pr-0"
                : "dashboard-main-scroll overflow-x-hidden overflow-y-auto overscroll-contain px-3 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5 sm:pt-4 lg:px-6 lg:pt-5 lg:pb-5"
            }`}
        >
          <div
            className={`w-full min-w-0 max-w-full ${flushBottom || isSyncing ? "flex min-h-0 flex-1 flex-col" : ""
              }`}
          >
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}