/**
 * components/layout/MobileBottomNav.jsx
 * Dark pill bottom navigation for mobile.
 */

import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../../config/navigation";
import { IconDashboard, IconExpenses } from "../ui/Icons";

const NAV_ICONS = {
  dashboard: IconDashboard,
  expenses: IconExpenses,
};

const MobileBottomNav = () => (
  <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 lg:hidden">
    <div className="flex items-center justify-around rounded-full bg-primaryDark px-2 py-2 shadow-pill">
      {NAV_ITEMS.map((item) => {
        const Icon = NAV_ICONS[item.key];
        return (
          <NavLink
            key={item.key}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative flex h-12 w-12 items-center justify-center rounded-full transition ${
                isActive ? "bg-white/15 text-white" : "text-white/70"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-5 w-5" />
                {isActive && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accentGreen" />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  </nav>
);

export default MobileBottomNav;
