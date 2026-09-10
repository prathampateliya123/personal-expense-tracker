/**
 * layouts/SettingsLayout.jsx
 * Settings module shell — nested sidebar + content outlet.
 */

import { NavLink, Outlet } from "react-router-dom";
import SettingsSidebar from "./SettingsSidebar";
import { SETTINGS_NAV_ITEMS } from "../utils/navigation";
import { IconPayments } from "../components/ui/Icons";

const SETTINGS_ICONS = {
  paymentMethods: IconPayments,
};

const SettingsLayout = () => (
  <div className="flex w-full min-w-0 flex-col gap-4 md:flex-row md:gap-0">
    {/* Mobile settings sub-nav */}
    <div className="flex gap-2 overflow-x-auto md:hidden">
      {SETTINGS_NAV_ITEMS.map((item) => {
        const Icon = SETTINGS_ICONS[item.key];
        return (
          <NavLink
            key={item.key}
            to={item.to}
            className={({ isActive }) =>
              `inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "border-accentGreen bg-successBg text-primaryDark"
                  : "border-border bg-white text-textSecondary"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        );
      })}
    </div>

    <div className="table-panel flex min-h-[60vh] w-full min-w-0 overflow-hidden md:min-h-[calc(100dvh-8.5rem)]">
      <SettingsSidebar />
      <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-white p-4 sm:p-5 lg:p-6">
        <Outlet />
      </div>
    </div>
  </div>
);

export default SettingsLayout;
