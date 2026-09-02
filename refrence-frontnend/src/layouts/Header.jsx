import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { LogoutIcon, Bars3Icon, ChevronDownIcon, PlusIcon, UserIcon } from "../components/ui/Icons";
import authService, { extractRedirectUrl, getNameFromEmail } from "../services/authService";
import userService from "../services/userService";
import { useStore } from "../context/StoreContext";
import { useUserProfile } from "../context/UserProfileContext";
import { MessageBox } from "../components/ui/MessageBox";
import Button from "../components/ui/Button";
import { authKeys } from "../services/queryKeys";
import { clearCookie, getCookie, TOKEN_NAME } from "../utils/cookie";
import {
  clearPendingAccountType,
  setPendingAdsConnectStoreId
} from "../utils/storage";
import { computeDropdownStyle } from "../utils/dropdownPosition";

const FALLBACK_NAME = "User";

const getInitial = (name = "") => {
  const value = String(name).trim();
  return value ? value.charAt(0).toUpperCase() : "U";
};

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState(null);
  const {
    email: profileEmail,
    name: profileName,
    isLoading,
    isFetched,
    ensureLoaded
  } = useUserProfile();
  const { selectedStore } = useStore();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const showConnectAds = Boolean(selectedStore) && !selectedStore.is_ads_connected;

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const email = profileEmail || "";
  const name =
    profileName ||
    (email ? getNameFromEmail(email) : "") ||
    (isLoading || !isFetched ? "" : FALLBACK_NAME);
  const initial = getInitial(name || email);

  const connectAdsMutation = useMutation({
    mutationFn: async () => {
      const authToken = getCookie(TOKEN_NAME);
      return userService.connectAmazonAds(authToken);
    },
    onSuccess: (data) => {
      const redirectUrl = extractRedirectUrl(data);
      if (!redirectUrl) {
        MessageBox("error", "Amazon Ads redirect URL was not found. Please try again.");
        return;
      }
      window.location.assign(redirectUrl);
    }
  });

  const logoutMutation = useMutation({
    mutationKey: authKeys.logout(),
    mutationFn: async () => {
      const token = getCookie(TOKEN_NAME);
      return authService.logout(token);
    }
  });

  const updateMenuPosition = () => {
    const trigger = dropdownRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menu = menuRef.current;
    setMenuStyle(
      computeDropdownStyle(rect, {
        menuWidth: Math.min(260, window.innerWidth - 24),
        menuHeight: menu?.offsetHeight || 180,
        align: "right",
        matchWidth: false
      })
    );
  };

  useLayoutEffect(() => {
    if (!isDropdownOpen) {
      setMenuStyle(null);
      return undefined;
    }
    updateMenuPosition();
    const frame = window.requestAnimationFrame(updateMenuPosition);
    return () => window.cancelAnimationFrame(frame);
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!isDropdownOpen) return undefined;

    const isInside = (target) =>
      dropdownRef.current?.contains(target) || menuRef.current?.contains(target);

    const handleOutsideClick = (event) => {
      if (!isInside(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    const onReposition = () => updateMenuPosition();

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    if (loggingOut || logoutMutation.isPending) return;

    try {
      setLoggingOut(true);
      setIsDropdownOpen(false);
      await logoutMutation.mutateAsync();
    } catch {
      void 0;
    } finally {
      clearCookie();
      setLoggingOut(false);
      navigate("/sign-in", { replace: true });
    }
  };

  const handleConnectAds = () => {
    if (connectAdsMutation.isPending) return;
    if (!selectedStore?.id) {
      MessageBox("error", "Select a store before connecting ads.");
      return;
    }

    clearPendingAccountType();
    setPendingAdsConnectStoreId(selectedStore.id);
    connectAdsMutation.mutate();
  };

  return (
    <header className="relative z-30 h-[calc(3.5rem+env(safe-area-inset-top))] sm:h-[calc(4rem+env(safe-area-inset-top))] shrink-0 border-b border-[var(--border)] bg-[var(--header-bg)] flex items-center justify-between gap-2 sm:gap-3 px-3 pt-[env(safe-area-inset-top)] sm:px-4 lg:px-6 shadow-[0_1px_0_rgba(17,24,39,0.03)]">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {typeof onMenuClick === "function" && (
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 sm:w-9 sm:h-9 rounded-[7px] border border-[var(--border)] flex items-center justify-center text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors cursor-pointer shrink-0"
            aria-label="Open Sidebar"
          >
            <Bars3Icon className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
        {showConnectAds && (
          <Button
            type="button"
            size="sm"
            onClick={handleConnectAds}
            disabled={connectAdsMutation.isPending}
            className="h-auto shrink-0 gap-1.5 px-2.5 py-2 text-[12px] sm:gap-2 sm:px-3.5 sm:text-[13px]"
          >
            {connectAdsMutation.isPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-[2px] border-white/30 border-t-white" />
            ) : (
              <>
                <PlusIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Connect Ads</span>
                <span className="sm:hidden">Ads</span>
              </>
            )}
          </Button>
        )}

        <div className="relative hidden max-w-full shrink-0 lg:block" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="inline-flex max-w-[min(100vw-8rem,320px)] cursor-pointer items-center gap-2 rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-1.5 py-1.5 text-left transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--canvas)] sm:gap-2.5 sm:px-2"
            aria-haspopup="menu"
            aria-expanded={isDropdownOpen}
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] bg-[var(--brand-orange)] text-[14px] font-semibold text-white">
              {initial}
            </span>
            <span className="hidden min-w-0 max-w-[100px] flex-col sm:flex sm:max-w-[180px] md:max-w-[220px]">
              <span className="truncate text-[13px] font-semibold leading-tight text-[var(--ink)] sm:text-[14px]">
                {name || (isLoading ? "Loading..." : FALLBACK_NAME)}
              </span>
              {email ? (
                <span className="mt-0.5 hidden truncate text-[11px] font-normal leading-tight text-[var(--ink-subtle)] sm:block">
                  {email}
                </span>
              ) : null}
            </span>
            <ChevronDownIcon
              className={`h-4 w-4 shrink-0 text-[var(--ink-subtle)] transition-transform ${isDropdownOpen ? "rotate-180" : ""
                }`}
              aria-hidden="true"
            />
          </button>

          {isDropdownOpen && menuStyle
            ? createPortal(
                <div
                  ref={menuRef}
                  role="menu"
                  style={menuStyle}
                  className="z-[9999] w-[min(260px,calc(100vw-1.5rem))] rounded-[7px] border border-[var(--border)] bg-[var(--surface)] py-1.5 shadow-[0_12px_40px_rgba(17,24,39,0.12)]"
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <div className="border-b border-[var(--border)] px-3.5 py-2.5">
                    <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)]">
                      Email
                    </p>
                    <p className="truncate text-[13px] font-medium text-[var(--ink)]" title={email || undefined}>
                      {email || "—"}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/profile");
                    }}
                    className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-medium text-[var(--ink)] transition-colors hover:bg-[var(--brand-orange-soft)] hover:text-[var(--brand-orange-strong)]"
                  >
                    <UserIcon className="h-4 w-4 text-[var(--ink-muted)]" aria-hidden="true" />
                    My Profile
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    disabled={loggingOut || logoutMutation.isPending}
                    className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-medium text-[var(--ink)] transition-colors hover:bg-[var(--brand-orange-soft)] hover:text-[var(--brand-orange-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loggingOut || logoutMutation.isPending ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-[2px] border-[var(--border)] border-t-[var(--ink)]" />
                    ) : (
                      <LogoutIcon className="h-4 w-4 text-[var(--ink-muted)]" aria-hidden="true" />
                    )}
                    Logout
                  </button>
                </div>,
                document.body
              )
            : null}
        </div>
      </div>
    </header>
  );
}