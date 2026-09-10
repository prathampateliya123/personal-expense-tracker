/**
 * layouts/MobileBottomNav.jsx
 * Dark pill bottom navigation for mobile.
 */

import { NavLink, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../utils/navigation";
import {
  IconDashboard,
  IconExpenses,
  IconCategories,
  IconSettings,
} from "../components/ui/Icons";

const NAV_ICONS = {
  dashboard: IconDashboard,
  expenses: IconExpenses,
  categories: IconCategories,
  settings: IconSettings,
};

const MobileBottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 lg:hidden">
      <div className="flex items-center justify-around rounded-full bg-primaryDark px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.key];
          return (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.end}
              className={({ isActive }) => {
                const active =
                  item.key === "settings"
                    ? pathname.startsWith("/settings")
                    : isActive;
                return `relative flex h-12 w-12 items-center justify-center rounded-full transition ${
                  active ? "bg-white/15 text-white" : "text-white/70"
                }`;
              }}
            >
              {({ isActive }) => {
                const active =
                  item.key === "settings"
                    ? pathname.startsWith("/settings")
                    : isActive;
                return (
                  <>
                    <Icon className="h-5 w-5" />
                    {active ? (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accentGreen" />
                    ) : null}
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
