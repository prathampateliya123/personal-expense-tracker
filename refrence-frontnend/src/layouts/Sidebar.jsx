import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  BoltIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  HomeIcon,
  ListBulletIcon,
  LogoutIcon,
  MegaphoneIcon,
  RectangleGroupIcon,
  ShoppingBagIcon,
  TagIcon,
  UserIcon,
  XMarkIcon,
  NoSymbolIcon
} from "../components/ui/Icons";
import StoreSelector from "../components/store/StoreSelector";
import { useUserProfile } from "../context/UserProfileContext";
import authService, { getNameFromEmail } from "../services/authService";
import { authKeys } from "../services/queryKeys";
import { clearCookie, getCookie, TOKEN_NAME } from "../utils/cookie";

const FALLBACK_NAME = "User";

const PRIMARY_LINKS = [
  { to: "/", label: "Dashboard", end: true, icon: HomeIcon }
];

const ASIN_LINKS = [
  { to: "/asin-list", label: "ASIN List", icon: ListBulletIcon },
  { to: "/asin-grouping", label: "ASIN Grouping", icon: RectangleGroupIcon }
];

const REPORT_LINKS = [
  { to: "/reports/campaign-list", label: "Campaign List", icon: ListBulletIcon },
  { to: "/reports/advertised-product", label: "Advertised Product", icon: ShoppingBagIcon },
  { to: "/reports/ad-group-performance", label: "Ad Group Performance", icon: RectangleGroupIcon },
  { to: "/reports/budget-pacing", label: "Budget & Pacing", icon: CurrencyDollarIcon },
  { to: "/reports/campaign-performance", label: "Campaign Performance", icon: MegaphoneIcon },
  { to: "/reports/keyword-targeting", label: "Keyword Targeting", icon: TagIcon },
  { to: "/reports/negative-keyword-list", label: "Negative Keyword List", icon: XMarkIcon },
  { to: "/reports/negative-target-list", label: "Negative Target List", icon: NoSymbolIcon },
  { to: "/reports/placement-report", label: "Placement Report", icon: ChartBarIcon },
  { to: "/reports/search-term-report", label: "Search Term Report", icon: ClipboardDocumentListIcon }
];

const SECONDARY_LINKS = [
  { to: "/rule-builder", label: "Rule Builder", icon: BoltIcon }
];

const PROFILE_LINK = { to: "/profile", label: "My Profile", icon: UserIcon };

const getInitial = (name = "") => {
  const value = String(name).trim();
  return value ? value.charAt(0).toUpperCase() : "U";
};

function NavItem({ link, onNavigate, nested = false }) {
  const Icon = link.icon;
  return (
    <NavLink
      to={link.to}
      end={Boolean(link.end)}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-[7px] transition-colors ${
          nested ? "px-3 py-2" : "px-3 py-2.5"
        } ${
          isActive
            ? "bg-[var(--sidebar-active)] text-[var(--sidebar-text-active)] font-semibold"
            : "text-[var(--sidebar-text)] font-medium hover:bg-[var(--sidebar-hover)] hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`h-[18px] w-[18px] shrink-0 ${
              isActive
                ? "text-[var(--brand-orange)]"
                : "text-white/45 group-hover:text-white/75"
            }`}
            aria-hidden="true"
          />
          <span className={`leading-snug ${nested ? "text-[12.5px]" : "text-[13px]"}`}>
            {link.label}
          </span>
        </>
      )}
    </NavLink>
  );
}

function TreeBranch({ isLast }) {
  return (
    <span className="pointer-events-none absolute left-0 top-0 h-full w-4" aria-hidden="true">
      <span
        className="absolute left-[7px] top-0 w-px bg-white/25"
        style={{ height: "calc(50% - 12px)" }}
      />
      <svg
        className="absolute left-[7px] top-1/2 -translate-y-full overflow-visible"
        width="12"
        height="12"
        viewBox="0 0 12 12"
      >
        <path
          d="M 0.5 0 Q 0.5 11.5 11.5 11.5"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {!isLast ? (
        <span className="absolute left-[7px] top-1/2 bottom-0 w-px bg-white/25" />
      ) : null}
    </span>
  );
}

function NavAccordion({
  id,
  label,
  icon: Icon,
  open,
  onToggle,
  active,
  links,
  onNavigate
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className={`group flex w-full items-center gap-3 rounded-[7px] px-3 py-2.5 transition-colors duration-200 cursor-pointer ${
          active
            ? "bg-[var(--sidebar-active)] text-[var(--sidebar-text-active)] font-semibold"
            : "text-[var(--sidebar-text)] font-medium hover:bg-[var(--sidebar-hover)] hover:text-white"
        }`}
      >
        <Icon
          className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${
            active ? "text-[var(--brand-orange)]" : "text-white/45 group-hover:text-white/75"
          }`}
          aria-hidden="true"
        />
        <span className="flex-1 text-left text-[13px] leading-snug">{label}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-white/45 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            open ? "rotate-180" : "rotate-0"
          }`}
          aria-hidden="true"
        />
      </button>

      <div
        id={id}
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <ul
            className={`mt-0.5 ml-[13px] transition-opacity duration-300 ease-out motion-reduce:transition-none ${
              open ? "opacity-100" : "opacity-0"
            }`}
            inert={!open ? true : undefined}
          >
            {links.map((link, index) => (
              <li key={link.to} className="relative pl-4">
                <TreeBranch isLast={index === links.length - 1} />
                <NavItem link={link} onNavigate={onNavigate} nested />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    email: profileEmail,
    name: profileName,
    isLoading,
    isFetched,
    ensureLoaded
  } = useUserProfile();

  const isReportsRoute = useMemo(
    () => location.pathname.startsWith("/reports"),
    [location.pathname]
  );
  const isAsinRoute = useMemo(
    () => location.pathname === "/asin-list" || location.pathname === "/asin-grouping",
    [location.pathname]
  );

  const [openMenu, setOpenMenu] = useState(() =>
    isAsinRoute ? "asin" : isReportsRoute ? "reports" : null
  );
  const [motionReady, setMotionReady] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const email = profileEmail || "";
  const name =
    profileName ||
    (email ? getNameFromEmail(email) : "") ||
    (isLoading || !isFetched ? "" : FALLBACK_NAME);
  const initial = getInitial(name || email);

  const logoutMutation = useMutation({
    mutationKey: authKeys.logout(),
    mutationFn: async () => {
      const token = getCookie(TOKEN_NAME);
      return authService.logout(token);
    }
  });

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  useEffect(() => {
    if (isAsinRoute) setOpenMenu("asin");
    else if (isReportsRoute) setOpenMenu("reports");
  }, [isAsinRoute, isReportsRoute]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setMotionReady(true));
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  const handleLogout = async () => {
    if (loggingOut || logoutMutation.isPending) return;
    try {
      setLoggingOut(true);
      await logoutMutation.mutateAsync();
    } catch {
      void 0;
    } finally {
      clearCookie();
      setLoggingOut(false);
      onClose?.();
      navigate("/sign-in", { replace: true });
    }
  };

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-[var(--sidebar-bg)]/50 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={[
          "flex h-full w-[272px] shrink-0 flex-col border-r border-white/10 bg-[var(--sidebar-bg)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
          "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-40 max-lg:w-[min(272px,88vw)]",
          open ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
          motionReady
            ? "max-lg:transition-transform max-lg:duration-300"
            : "max-lg:transition-none"
        ].join(" ")}
      >
        <div className="flex min-h-12 shrink-0 items-center gap-1.5 border-b border-white/10 px-2.5 py-2 sm:min-h-14 sm:gap-2 sm:px-3 sm:h-16 sm:py-0">
          <div className="min-w-0 flex-1">
            <StoreSelector variant="dark" onStoreSelect={onClose} />
          </div>
        </div>

        {/* Mobile / tablet: profile lives in sidebar instead of header */}
        <div className="shrink-0 border-b border-white/10 px-3 py-3 lg:hidden">
          <div className="flex min-w-0 items-center gap-2.5 rounded-[7px] bg-white/[0.06] px-2.5 py-2.5">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] bg-[var(--brand-orange)] text-[14px] font-semibold text-white">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight text-white">
                {name || (isLoading ? "Loading..." : FALLBACK_NAME)}
              </p>
              {email ? (
                <p className="mt-0.5 truncate text-[11px] font-normal leading-tight text-white/50">
                  {email}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <nav className="dashboard-main-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3 sm:py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/35">
            Menu
          </p>

          <ul className="space-y-0.5">
            {PRIMARY_LINKS.map((link) => (
              <li key={link.to}>
                <NavItem link={link} onNavigate={onClose} />
              </li>
            ))}

            <NavAccordion
              id="sidebar-asin-menu"
              label="ASIN"
              icon={TagIcon}
              open={openMenu === "asin"}
              onToggle={() =>
                setOpenMenu((prev) => (prev === "asin" ? null : "asin"))
              }
              active={isAsinRoute}
              links={ASIN_LINKS}
              onNavigate={onClose}
            />

            <NavAccordion
              id="sidebar-reports-menu"
              label="Reports"
              icon={DocumentTextIcon}
              open={openMenu === "reports"}
              onToggle={() =>
                setOpenMenu((prev) => (prev === "reports" ? null : "reports"))
              }
              active={isReportsRoute}
              links={REPORT_LINKS}
              onNavigate={onClose}
            />

            {SECONDARY_LINKS.map((link) => (
              <li key={link.to}>
                <NavItem link={link} onNavigate={onClose} />
              </li>
            ))}

            {/* Mobile / tablet: My Profile in sidebar */}
            <li className="lg:hidden">
              <NavItem link={PROFILE_LINK} onNavigate={onClose} />
            </li>
          </ul>
        </nav>

        {/* Mobile / tablet: sticky logout */}
        <div className="shrink-0 border-t border-white/10 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut || logoutMutation.isPending}
            className="flex w-full cursor-pointer items-center gap-3 rounded-[7px] px-3 py-2.5 text-left text-[13px] font-medium text-[var(--sidebar-text)] transition-colors hover:bg-[var(--sidebar-hover)] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loggingOut || logoutMutation.isPending ? (
              <span className="h-[18px] w-[18px] shrink-0 animate-spin rounded-full border-[2px] border-white/25 border-t-white" />
            ) : (
              <LogoutIcon className="h-[18px] w-[18px] shrink-0 text-white/45" aria-hidden="true" />
            )}
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
