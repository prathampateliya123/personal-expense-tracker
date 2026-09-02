import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ChevronsUpDownIcon, SearchIcon, StoreIcon } from '../ui/Icons';
import Button from '../ui/Button';
import { useStore } from "../../context/StoreContext";
import CountryFlag from "./CountryFlag";
import SyncProgress from "./SyncProgress";

const PANEL_WIDTH = 320;

export default function StoreSelector({ variant = "light", onStoreSelect }) {
  const navigate = useNavigate();
  const { stores, selectedStore, selectStore, isLoading } = useStore();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [panelStyle, setPanelStyle] = useState({
    top: 0,
    left: 0,
    arrowTop: 20,
    width: PANEL_WIDTH,
    hideArrow: false
  });
  const isDark = variant === "dark";

  const filteredStores = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return stores;
    return stores.filter((store) => String(store.store_name || "").toLowerCase().includes(query));
  }, [stores, search]);

  const closePanel = () => {
    setOpen(false);
    setSearch("");
  };

  const goToAddStore = () => {
    closePanel();
    navigate("/add-store");
  };

  const goToStores = () => {
    closePanel();
    navigate("/stores");
  };

  const updatePanelPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const aside = trigger.closest("aside");
    const asideRect = aside?.getBoundingClientRect();
    const gap = 20;
    const viewportPadding = 12;
    const panelWidth = Math.min(PANEL_WIDTH, window.innerWidth - viewportPadding * 2);
    const isCompact = window.innerWidth < 768;

    let left;
    let top;

    if (isCompact) {
      left = Math.max(viewportPadding, (window.innerWidth - panelWidth) / 2);
      top = Math.min(rect.bottom + 12, window.innerHeight - viewportPadding - 120);
    } else {
      const sidebarRight = asideRect?.right ?? rect.right;
      left = sidebarRight + gap;
      top = rect.top;

      const maxLeft = window.innerWidth - panelWidth - viewportPadding;
      if (left > maxLeft) {
        left = Math.max(sidebarRight + gap, maxLeft);
      }

      if (left + panelWidth > window.innerWidth - viewportPadding) {
        left = Math.min(sidebarRight + gap, maxLeft);
        top = rect.bottom + 12;
      }
    }

    const estimatedHeight = panelRef.current?.offsetHeight || 380;
    if (top + estimatedHeight > window.innerHeight - viewportPadding) {
      top = Math.max(viewportPadding, window.innerHeight - estimatedHeight - viewportPadding);
    }

    const triggerCenterY = rect.top + rect.height / 2;
    const arrowTop = Math.min(
      Math.max(triggerCenterY - top - 8, 16),
      Math.max(estimatedHeight - 32, 16)
    );

    setPanelStyle({ top, left, arrowTop, width: panelWidth, hideArrow: isCompact });
  };

  useLayoutEffect(() => {
    if (!open) return undefined;
    updatePanelPosition();
    const handleReposition = () => updatePanelPosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, filteredStores.length, search]);

  useEffect(() => {
    if (!open) return undefined;

    const handleOutsideClick = (event) => {
      const inTrigger = rootRef.current?.contains(event.target);
      const inPanel = panelRef.current?.contains(event.target);
      if (!inTrigger && !inPanel) {
        closePanel();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") closePanel();
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const displayName = selectedStore?.store_name || "Select store";
  const countryCode = selectedStore?.country_code || "";

  const panel = open
    ? createPortal(
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Switch stores"
        style={{
          position: "fixed",
          top: panelStyle.top,
          left: panelStyle.left,
          width: panelStyle.width || PANEL_WIDTH,
          zIndex: 80
        }}
        className="rounded-[7px] border border-[var(--ink)]/12 bg-[var(--surface)] text-[var(--ink)] shadow-[0_16px_48px_rgba(0,0,0,0.12)]"
      >
        {!panelStyle.hideArrow ? (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-[9px] h-0 w-0 border-y-[9px] border-r-[9px] border-y-transparent border-r-[var(--ink)]/12"
              style={{ top: panelStyle.arrowTop }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-[8px] h-0 w-0 border-y-[8px] border-r-[8px] border-y-transparent border-r-[var(--surface)]"
              style={{ top: panelStyle.arrowTop + 1 }}
            />
          </>
        ) : null}

        <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
          <h2 className="text-[15px] font-semibold text-[var(--ink)]">Switch Stores</h2>
          <button
            type="button"
            onClick={goToStores}
            className="text-[13px] font-medium text-[var(--ink)] underline underline-offset-2 hover:text-[var(--brand-orange)] cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="px-4 pb-3">
          <label className="relative block">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink)]/40" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by store name..."
              className="w-full rounded-[7px] border border-[var(--ink)]/15 bg-[var(--surface)] py-2.5 pl-9 pr-3 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink)]/40 focus:border-[var(--brand-orange)]"
            />
          </label>
        </div>

        <div className="max-h-[220px] overflow-y-auto px-2 pb-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <span className="mb-3 h-8 w-8 animate-spin rounded-full border-[3px] border-[var(--ink)]/15 border-t-[var(--brand-orange)]" />
              <p className="text-[13px] text-[var(--ink)]/55">Loading stores...</p>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <StoreIcon className="mb-3 h-10 w-10 text-[var(--ink)]/50" />
              <p className="text-[14px] font-semibold text-[var(--ink)]">
                {stores.length === 0 ? "Create new store" : "No stores found"}
              </p>
            </div>
          ) : (
            <ul className="space-y-1" role="listbox" aria-label="Stores">
              {filteredStores.map((store) => {
                const selected = String(store.id) === String(selectedStore?.id);
                return (
                  <li key={store.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        selectStore(store.id);
                        closePanel();
                        onStoreSelect?.();
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-[7px] border px-2.5 py-2.5 text-left transition-colors cursor-pointer ${selected
                          ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]/10"
                          : "border-transparent hover:bg-[var(--ink)]/[0.03]"
                        }`}
                    >
                      <span className="relative shrink-0">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-[7px] border border-[var(--ink)]/10 bg-[var(--ink)]/[0.04] text-[var(--ink)]">
                          <StoreIcon className="h-4 w-4" />
                        </span>
                        {store.country_code ? (
                          <CountryFlag
                            countryCode={store.country_code}
                            className="absolute -bottom-0.5 -right-0.5 scale-90"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-bold leading-snug text-[var(--ink)]">
                          {store.store_name || "Untitled store"}
                        </span>
                        <span className="mt-0.5 block truncate text-[12px] font-medium uppercase tracking-wide text-[var(--ink)]/50">
                          {store.account_type || "store"}
                          {store.country_code ? ` · ${store.country_code}` : ""}
                        </span>
                      </span>
                      <span className="shrink-0">
                        <SyncProgress value={store.sync_per} size={36} strokeWidth={3.5} showLabel={false} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-[var(--ink)]/10 p-3">
          <Button type="button" fullWidth size="md" onClick={goToAddStore} className="text-[16px]">
            + Add New Store
          </Button>
        </div>
      </div>,
      document.body
    )
    : null;

  return (
    <div className="relative w-full min-w-0" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title={displayName}
        className={`flex w-full min-w-0 items-center gap-2 rounded-[7px] border px-2 py-1 text-left transition-colors cursor-pointer sm:gap-2.5 sm:px-2.5 sm:py-1.5 ${isDark
            ? open
              ? "border-[var(--brand-orange)] bg-white/10"
              : "border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25"
            : open
              ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]/10"
              : "border-[var(--ink)]/10 bg-[var(--surface)] hover:border-[var(--ink)]/25 hover:bg-[var(--ink)]/[0.02]"
          }`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="relative shrink-0">
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-[7px] border sm:h-9 sm:w-9 ${isDark
                ? "border-white/15 bg-white/10 text-white"
                : "border-[var(--ink)]/10 bg-[var(--ink)]/[0.04] text-[var(--ink)]"
              }`}
          >
            <StoreIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </span>
          {countryCode ? (
            <CountryFlag
              countryCode={countryCode}
              className="absolute -bottom-0.5 -right-0.5 scale-[0.85] sm:scale-100"
            />
          ) : null}
        </span>

        <span className="min-w-0 flex-1 overflow-hidden">
          <span
            className={`block truncate text-[12px] font-bold leading-snug sm:text-[14px] ${isDark ? "text-white" : "text-[var(--ink)]"
              }`}
          >
            {displayName}
          </span>
          <span
            className={`mt-0.5 block truncate text-[10px] font-semibold sm:text-[12px] ${
              isDark ? "text-white/55" : "text-[var(--ink)]/55"
            }`}
          >
            Store view
          </span>
        </span>

        <ChevronsUpDownIcon
          className={`h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 ${isDark ? "text-white/45" : "text-[var(--ink)]/45"}`}
        />
      </button>

      {panel}
    </div>
  );
}