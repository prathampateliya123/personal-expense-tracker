import { NavLink } from "react-router-dom";
import { BuildingStorefrontIcon, KeyIcon, UserIcon } from "../components/ui/Icons";

const ACCOUNT_ITEMS = [
  { to: "/profile", label: "My Profile", icon: UserIcon },
  { to: "/change-password", label: "Change Password", icon: KeyIcon }
];

const STORE_ITEMS = [
  { to: "/brand-details", label: "Brand Details", icon: BuildingStorefrontIcon }
];

const ALL_ITEMS = [...ACCOUNT_ITEMS, ...STORE_ITEMS];

const linkClass = ({ isActive }) =>
  `flex items-center gap-2.5 rounded-[7px] px-3 py-2.5 text-[13px] transition-colors whitespace-nowrap ${isActive
    ? "bg-[var(--brand-orange-soft)] font-semibold text-[var(--ink)] border border-[var(--brand-orange)]/30"
    : "font-medium text-[var(--ink-muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)] border border-transparent"
  }`;

function NavSection({ title, items }) {
  return (
    <div>
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink to={item.to} end className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-4 w-4 shrink-0 ${isActive ? "text-[var(--brand-orange)]" : "text-[var(--ink-subtle)]"
                        }`}
                      aria-hidden="true"
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function AccountSettingsNav() {
  return (
    <>
      <nav className="md:hidden -mx-1 overflow-x-auto overscroll-x-contain pb-1">
        <ul className="flex items-center gap-1.5 min-w-max px-1">
          {ALL_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink to={item.to} end className={linkClass}>
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`h-4 w-4 shrink-0 ${isActive ? "text-[var(--brand-orange)]" : "text-[var(--ink-subtle)]"
                          }`}
                        aria-hidden="true"
                      />
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav className="hidden md:block space-y-6">
        <NavSection title="Account Settings" items={ACCOUNT_ITEMS} />
        <NavSection title="Store Settings" items={STORE_ITEMS} />
      </nav>
    </>
  );
}