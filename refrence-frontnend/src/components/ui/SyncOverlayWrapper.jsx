import { Outlet } from "react-router-dom";
import { useStore } from "../../context/StoreContext";

export default function SyncOverlayWrapper({ children }) {
  const { selectedStore } = useStore();
  const syncPer = selectedStore?.sync_per ?? 100;
  
  if (syncPer >= 100) {
    return children ?? <Outlet />;
  }

  return (
    <div className="relative w-full h-full flex flex-col flex-1 min-h-0 overflow-hidden bg-[var(--canvas)]">
      <div className="pointer-events-none select-none blur-sm opacity-60 w-full h-full overflow-hidden flex flex-col flex-1 min-h-0">
        {children ?? <Outlet />}
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <div className="max-w-sm w-full mx-4 flex flex-col items-center text-center">
          <h2 className="text-lg font-medium text-[var(--ink)] mb-1">Syncing Data</h2>
          <p className="text-[var(--ink-muted)] text-sm mb-6">
            Please wait while we sync data for <span className="font-medium text-[var(--ink)]">{selectedStore?.store_name || "this store"}</span>.
          </p>
          
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 bg-[var(--border)] rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-[var(--brand-orange)] h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.max(0, Math.min(100, syncPer))}%` }}
              />
            </div>
            <span className="text-[var(--ink-strong)] font-medium text-sm tabular-nums min-w-[36px] text-right">
              {syncPer}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
