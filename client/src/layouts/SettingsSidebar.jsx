/**
 * layouts/SettingsSidebar.jsx
 * Nested sidebar for Settings section.
 */

import { NavLink } from "react-router-dom";
import { SETTINGS_NAV_ITEMS, SETTINGS_SIDEBAR_WIDTH } from "../utils/navigation";
import { IconPayments } from "../components/ui/Icons";

const SETTINGS_ICONS = {
  paymentMethods: IconPayments,
};

const SettingsNavItem = ({ to, label, icon: Icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        isActive
          ? "bg-successBg text-primaryDark"
          : "text-textSecondary hover:bg-surfaceGray hover:text-textPrimary"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon
          className={`h-5 w-5 shrink-0 ${
            isActive ? "text-accentGreen" : "text-textSecondary"
          }`}
        />
        <span>{label}</span>
      </>
    )}
  </NavLink>
);

const SettingsSidebar = () => (
  <aside
    style={{ width: SETTINGS_SIDEBAR_WIDTH }}
    className="hidden h-full shrink-0 flex-col border-r border-border bg-white md:flex"
  >
    <div className="border-b border-border px-4 py-4">
      <p className="text-sm font-semibold text-primaryDark">Settings</p>
      <p className="mt-0.5 text-xs text-textSecondary">App preferences</p>
    </div>

    <nav className="sidebar-scroll min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {SETTINGS_NAV_ITEMS.map((item) => (
        <SettingsNavItem
          key={item.key}
          {...item}
          icon={SETTINGS_ICONS[item.key]}
        />
      ))}
    </nav>
  </aside>
);

export default SettingsSidebar;
