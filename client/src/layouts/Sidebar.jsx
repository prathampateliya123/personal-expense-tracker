import { NavLink } from "react-router-dom";
import { NAV_ITEMS, SIDEBAR_WIDTH } from "../utils/navigation";
import BrandLogo from "../components/common/BrandLogo";
import {
  IconClose,
  IconDashboard,
  IconExpenses,
  IconIncomes,
  IconBudgets,
  IconWealth,
  IconCategories,
  IconSettings,
} from "../components/ui/Icons";

const NAV_ICONS = {
  dashboard: IconDashboard,
  expenses: IconExpenses,
  incomes: IconIncomes,
  budgets: IconBudgets,
  wealth: IconWealth,
  categories: IconCategories,
  settings: IconSettings,
};

const NavItem = ({ to, label, icon: Icon, end, onNavigate }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onNavigate}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        isActive
          ? "bg-accentGreen text-primaryDark"
          : "text-textSecondary hover:bg-surfaceGray hover:text-textPrimary"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon
          className={`h-5 w-5 shrink-0 ${
            isActive ? "text-primaryDark" : "text-textSecondary"
          }`}
        />
        <span>{label}</span>
      </>
    )}
  </NavLink>
);

const Sidebar = ({ isOpen, onClose }) => (
  <>
    {isOpen ? (
      <div
        className="fixed inset-0 z-30 bg-textPrimary/30 backdrop-blur-[2px] lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
    ) : null}

    <aside
      style={{ width: SIDEBAR_WIDTH }}
      className={[
        "flex h-full shrink-0 flex-col border-r border-border bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
        "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-40 max-lg:w-[min(272px,88vw)]",
        isOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
        "max-lg:transition-transform max-lg:duration-300",
      ].join(" ")}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 sm:h-16 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandLogo variant="icon" size="sm" />
          <div className="min-w-0">
            <p className="font-pixel truncate text-[9px] leading-tight text-primaryDark">
              Expense
            </p>
            <p className="font-pixel truncate text-[9px] leading-tight text-accentGreen">
              Tracker
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-textSecondary hover:bg-surfaceGray lg:hidden"
          aria-label="Close sidebar"
        >
          <IconClose />
        </button>
      </div>

      <nav className="sidebar-scroll min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-textSecondary/70">
          Menu
        </p>
        {NAV_ITEMS.map(({ key, ...item }) => (
          <NavItem
            key={key}
            {...item}
            icon={NAV_ICONS[key]}
            onNavigate={onClose}
          />
        ))}
      </nav>
    </aside>
  </>
);

export default Sidebar;
