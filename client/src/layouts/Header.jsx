/**
 * layouts/Header.jsx
 * Top bar — mobile menu toggle and user avatar.
 */

import { useEffect, useRef, useState } from "react";
import {
  IconMenu,
  IconChevronDown,
  IconLogout,
} from "../components/ui/Icons";
import { getInitials } from "../utils/helper";

const Header = ({ user, onMenuClick, onLogout, logoutLoading }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <header className="relative z-30 flex h-[calc(3.5rem+env(safe-area-inset-top))] shrink-0 items-center justify-between gap-2 border-b border-border bg-white px-3 pt-[env(safe-area-inset-top)] shadow-sm sm:h-[calc(4rem+env(safe-area-inset-top))] sm:gap-3 sm:px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-textPrimary transition hover:bg-surfaceLight lg:hidden sm:h-9 sm:w-9"
        aria-label="Open menu"
      >
        <IconMenu />
      </button>

      <div className="relative ml-auto shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-full border border-border bg-white p-1 pr-3 shadow-sm transition hover:shadow-md"
          aria-expanded={menuOpen}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-green-card text-xs font-bold text-white">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              getInitials(user?.name)
            )}
          </div>
          <div className="hidden text-left sm:block">
            <p className="max-w-[120px] truncate text-sm font-semibold text-textPrimary">
              {user?.name}
            </p>
          </div>
          <IconChevronDown
            className={`hidden h-4 w-4 text-textSecondary transition-transform sm:block ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-3xl bg-white shadow-soft">
            <div className="border-b border-border bg-surfaceLight px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full gradient-green-card text-sm font-bold text-white">
                  {getInitials(user?.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-textPrimary">
                    {user?.name}
                  </p>
                  <p className="truncate text-xs text-textSecondary">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-60"
              >
                <IconLogout className="h-4 w-4" />
                {logoutLoading ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
