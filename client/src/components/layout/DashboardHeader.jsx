/**
 * components/layout/DashboardHeader.jsx
 * Top bar — search pill and user avatar.
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconMenu,
  IconChevronDown,
  IconLogout,
  IconSearch,
} from "../ui/Icons";
import { getInitials } from "../../utils/helpers";

const DashboardHeader = ({ user, onMenuClick, onLogout, logoutLoading }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/expenses?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 bg-appBg/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-2xl bg-surfaceGray p-2.5 text-textSecondary transition hover:bg-surfaceLight lg:hidden"
        aria-label="Open menu"
      >
        <IconMenu />
      </button>

      <form onSubmit={handleSearch} className="hidden flex-1 sm:block sm:max-w-md">
        <div className="relative">
          <IconSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses..."
            className="w-full rounded-full bg-surfaceGray py-2.5 pl-11 pr-4 text-sm text-textPrimary outline-none transition placeholder:text-textSecondary focus:bg-white focus:ring-2 focus:ring-accentGreen/20"
          />
        </div>
      </form>

      <div className="relative ml-auto" ref={menuRef}>
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

export default DashboardHeader;
