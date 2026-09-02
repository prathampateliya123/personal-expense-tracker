/**
 * layouts/Header.jsx
 * Top bar — mobile menu toggle and user profile dropdown.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  IconMenu,
  IconChevronDown,
  IconLogout,
} from "../components/ui/Icons";
import { getInitials } from "../utils/helper";
import { computeDropdownStyle } from "../utils/dropdownPosition";

const Header = ({ user, onMenuClick, onLogout, logoutLoading }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const updateMenuPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menu = menuRef.current;
    setMenuStyle(
      computeDropdownStyle(rect, {
        menuWidth: Math.min(280, window.innerWidth - 24),
        menuHeight: menu?.offsetHeight || 200,
        align: "right",
        minMenuWidth: 240,
        maxMenuWidth: 320,
      })
    );
  };

  useLayoutEffect(() => {
    if (!menuOpen) {
      setMenuStyle(null);
      return undefined;
    }
    updateMenuPosition();
    const frame = window.requestAnimationFrame(updateMenuPosition);
    return () => window.cancelAnimationFrame(frame);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const isInside = (target) =>
      triggerRef.current?.contains(target) || menuRef.current?.contains(target);

    const handleOutsideClick = (event) => {
      if (!isInside(event.target)) setMenuOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    const onReposition = () => updateMenuPosition();

    document.addEventListener("mousedown", handleOutsideClick, true);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick, true);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  const profileMenu =
    menuOpen && menuStyle
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={menuStyle}
            className="dropdown-panel z-[10050] overflow-hidden rounded-lg border border-border bg-white shadow-[0_12px_40px_rgba(13,59,46,0.14)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="border-b border-border bg-surfaceLight/80 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-green-card text-sm font-bold text-white">
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

            <div className="p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                disabled={logoutLoading}
                className="dropdown-menu__option dropdown-menu__option--danger w-full disabled:opacity-60"
              >
                <IconLogout className="h-4 w-4 shrink-0" />
                {logoutLoading ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

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

      <div className="relative ml-auto shrink-0" ref={triggerRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className={`inline-flex max-w-[min(100vw-5rem,320px)] items-center gap-2 rounded-lg border bg-white px-1.5 py-1.5 text-left transition-[border-color,box-shadow] duration-200 sm:gap-2.5 sm:px-2 ${
            menuOpen
              ? "border-accentGreen shadow-[0_0_0_3px_rgba(74,222,128,0.2)]"
              : "border-border hover:border-primaryLight/50 hover:bg-surfaceLight/60"
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-green-card text-xs font-bold text-white">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-9 w-9 rounded-lg object-cover"
              />
            ) : (
              getInitials(user?.name)
            )}
          </div>
          <div className="hidden min-w-0 text-left sm:block">
            <p className="max-w-[140px] truncate text-sm font-semibold text-textPrimary md:max-w-[180px]">
              {user?.name}
            </p>
            {user?.email ? (
              <p className="mt-0.5 hidden max-w-[140px] truncate text-[11px] text-textSecondary md:block md:max-w-[180px]">
                {user?.email}
              </p>
            ) : null}
          </div>
          <IconChevronDown
            className={`hidden h-4 w-4 shrink-0 text-textSecondary transition-transform duration-200 sm:block ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {profileMenu}
      </div>
    </header>
  );
};

export default Header;
