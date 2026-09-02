function Icon({
  className = "h-5 w-5",
  width,
  height,
  strokeWidth = 1.5,
  children,
  ...props
}) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      overflow="visible"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const DashboardIcon = ({ className }) => (
  <Icon className={className}>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </Icon>
);

export const ProfileIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

export const WalletIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
    <path d="M16 12h5v4h-5a2 2 0 0 1 0-4z" />
  </Icon>
);

export const CampaignsIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </Icon>
);

export const SettingsIcon = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Icon>
);

export const EyeOpenIcon = ({ width = 18, height = 18, className = "" }) => (
  <Icon className={className} width={width} height={height} strokeWidth={2}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const EyeClosedIcon = ({ width = 18, height = 18, className = "" }) => (
  <Icon className={className} width={width} height={height} strokeWidth={2}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </Icon>
);

export const AmazonIcon = ({ width = 22, height = 22, className = "shrink-0" }) => (
  <svg width={width} height={height} viewBox="0 0 448 512" aria-hidden="true" className={className}>
    <path fill="#000000" d="M257.2 162.7c-48.7 1.8-169.5 15.5-169.5 117.5 0 109.5 138.3 114 183.5 43.2 6.5 10.2 35.4 37.5 45.3 46.8l56.8-56S341 288.9 341 261.4V114.3C341 89 316.5 32 228.7 32 140.7 32 94 87 94 136.3l73.5 6.8c16.3-49.5 54.2-49.5 54.2-49.5 40.7-.1 35.5 29.8 35.5 69.1zm0 86.8c0 80-84.2 68-84.2 17.2 0-47.2 50.5-56.7 84.2-57.8v40.6zm136 163.5c-7.7 10-70 67-174.5 67S34.2 408.5 9.7 379c-6.8-7.7 1-11.3 5.5-8.3C88.5 415.2 203 488.5 387.7 401c7.5-3.7 13.3 2 5.5 12zm39.8 2.2c-6.5 15.8-16 26.8-21.2 31-5.5 4.5-9.5 2.7-6.5-3.8s19.3-46.5 25.7-73.3c1.7-6.5 9.7-3.5 13.5 4.5 7.5 18.5 6.5 35.5-11.5 41.6z" />
  </svg>
);

export const StoreIcon = ({ className = "w-5 h-5", width, height }) => (
  <Icon className={className} width={width} height={height} strokeWidth={1.75}>
    <path d="M3 9.5 5.5 4h13L21 9.5" />
    <path d="M4 9.5h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-10Z" />
    <path d="M9 20v-6h6v6" />
  </Icon>
);

export const ChevronsUpDownIcon = ({ className = "w-4 h-4" }) => (
  <Icon className={className} strokeWidth={2}>
    <polyline points="7 15 12 20 17 15" />
    <polyline points="7 9 12 4 17 9" />
  </Icon>
);

export const SearchIcon = ({ className = "w-4 h-4" }) => (
  <Icon className={className} strokeWidth={2}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

export const CheckMarkIcon = ({ className = "h-3 w-3", strokeWidth = 4 }) => (
  <Icon className={className} strokeWidth={strokeWidth}>
    <polyline points="20 6 9 17 4 12" />
  </Icon>
);

export const CheckIcon = ({
  className = "inline-flex h-5 w-5 items-center justify-center border-2 border-emerald-500 text-emerald-500"
}) => (
  <span className={className}>
    <CheckMarkIcon className="h-3 w-3" strokeWidth={3} />
  </span>
);

export const HomeIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20h5v-5h4v5h5V9.5" />
  </Icon>
);

export const ArrowLeftIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </Icon>
);

export const ArrowRightIcon = ({ className, strokeWidth = 2.5 }) => (
  <Icon className={className} strokeWidth={strokeWidth}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Icon>
);

export const LogoutIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
  </Icon>
);

export const Bars3Icon = ({ className }) => (
  <Icon className={className}>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </Icon>
);

export const XMarkIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </Icon>
);

export const PlusIcon = ({ className, strokeWidth = 1.5 }) => (
  <Icon className={className} strokeWidth={strokeWidth}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icon>
);

export const MinusIcon = ({ className, strokeWidth = 1.5 }) => (
  <Icon className={className} strokeWidth={strokeWidth}>
    <path d="M5 12h14" />
  </Icon>
);

/** Google Maps–style “my location” (crosshair + ring + center dot) */
export const LocateIcon = ({ className, strokeWidth = 1.75 }) => (
  <Icon className={className} strokeWidth={strokeWidth}>
    <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="7" />
    <path d="M12 2v2.5" />
    <path d="M12 19.5V22" />
    <path d="M2 12h2.5" />
    <path d="M19.5 12H22" />
  </Icon>
);

export const TrashIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </Icon>
);

export const PencilSquareIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </Icon>
);

export const EyeIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const UserIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

export const KeyIcon = ({ className }) => (
  <Icon className={className}>
    <circle cx="8" cy="15" r="4" />
    <path d="m10.7 12.3 8.8-8.8" />
    <path d="M17 5.5 19.5 8" />
    <path d="M15 7.5 17.5 10" />
  </Icon>
);

export const BuildingStorefrontIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M3 9.5 5.5 4h13L21 9.5" />
    <path d="M4 9.5h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-10Z" />
    <path d="M9 20v-6h6v6" />
  </Icon>
);

export const FunnelIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M4 4h16l-6 7.5V18l-4 2v-8.5Z" />
  </Icon>
);

export const BoltIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </Icon>
);

export const ClockIcon = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);

export const MegaphoneIcon = ({ className }) => (
  <Icon className={className}>
    <path d="m3 11 18-5v12L3 13v-2Z" />
    <path d="M11.5 16.5 10 21l3-1.5" />
  </Icon>
);

export const DocumentTextIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" />
    <path d="M9 13h6" />
    <path d="M9 17h6" />
  </Icon>
);

export const CalendarDaysIcon = ({ className }) => (
  <Icon className={className}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
    <path d="M3 10h18" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
  </Icon>
);

export const InfoCircleIcon = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 8h.01" />
  </Icon>
);

export const ChevronDownIcon = ({ className, strokeWidth = 2 }) => (
  <Icon className={className} strokeWidth={strokeWidth}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

export const ChevronLeftIcon = ({ className, strokeWidth = 2 }) => (
  <Icon className={className} strokeWidth={strokeWidth}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
);

export const ChevronRightIcon = ({ className, strokeWidth = 2 }) => (
  <Icon className={className} strokeWidth={strokeWidth}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
);

export const ArrowDownTrayIcon = ({ className, strokeWidth = 2 }) => (
  <Icon className={className} strokeWidth={strokeWidth}>
    <path d="M12 4v11" />
    <path d="m8 11 4 4 4-4" />
    <path d="M7 18v3" />
    <path d="M17 18v3" />
    <path d="M7 21h10" />
  </Icon>
);

export const ArrowUpTrayIcon = ({ className, strokeWidth = 2 }) => (
  <Icon className={className} strokeWidth={strokeWidth}>
    <path d="M12 16V5" />
    <path d="m8 9 4-4 4 4" />
    <path d="M7 18v3" />
    <path d="M17 18v3" />
    <path d="M7 21h10" />
  </Icon>
);

export const CheckCircleIcon = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </Icon>
);

export const AdjustmentsHorizontalIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M4 7h10" />
    <path d="M18 7h2" />
    <circle cx="16" cy="7" r="2" />
    <path d="M4 17h2" />
    <path d="M10 17h10" />
    <circle cx="8" cy="17" r="2" />
  </Icon>
);

export const ChartBarIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-7" />
    <path d="M22 20H2" />
  </Icon>
);

export const ClipboardDocumentListIcon = ({ className }) => (
  <Icon className={className}>
    <rect x="8" y="3" width="8" height="4" rx="1" />
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <path d="M9 12h6" />
    <path d="M9 16h6" />
  </Icon>
);

export const CurrencyDollarIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M12 3v18" />
    <path d="M16.5 7.5c-.8-1.2-2-2-4.5-2s-4 1.1-4 3c0 3.5 8 2 8 6 0 1.9-1.6 3-4 3s-3.7-.8-4.5-2" />
  </Icon>
);

export const ListBulletIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M9 6h11" />
    <path d="M9 12h11" />
    <path d="M9 18h11" />
    <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
  </Icon>
);

export const RectangleGroupIcon = ({ className }) => (
  <Icon className={className}>
    <rect x="3" y="3" width="8" height="8" rx="1" />
    <rect x="13" y="3" width="8" height="8" rx="1" />
    <rect x="3" y="13" width="8" height="8" rx="1" />
    <rect x="13" y="13" width="8" height="8" rx="1" />
  </Icon>
);

export const ShoppingBagIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M6 7h15l-1.5 9H8L6 7Z" />
    <path d="M6 7 5 3H2" />
    <circle cx="9" cy="20" r="1" />
    <circle cx="18" cy="20" r="1" />
  </Icon>
);

export const TagIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M12 3H4v8l9.5 9.5a1.5 1.5 0 0 0 2.1 0l5.9-5.9a1.5 1.5 0 0 0 0-2.1Z" />
    <circle cx="7.5" cy="7.5" r="1" />
  </Icon>
);

export const ViewColumnsIcon = ({ className }) => (
  <Icon className={className}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
    <path d="M15 4v16" />
  </Icon>
);

export const SortUpIcon = ({ className = "text-[var(--ink-subtle)]" }) => (
  <svg width="9" height="6" viewBox="0 0 9 6" fill="none" className={className} aria-hidden>
    <path
      d="M4.5 1.1L7.8 4.6H1.2L4.5 1.1Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
  </svg>
);

export const SortDownIcon = ({ className = "text-[var(--ink-subtle)]" }) => (
  <svg width="9" height="6" viewBox="0 0 9 6" fill="none" className={className} aria-hidden>
    <path
      d="M4.5 4.9L1.2 1.4H7.8L4.5 4.9Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
  </svg>
);

export const ErrorXCircleIcon = ({ className = "h-7 w-7", width = 28, height = 28 }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const NoSymbolIcon = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </Icon>
);

export const MinusCircleIcon = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </Icon>
);

export const ClipboardIcon = ({ width = 16, height = 16, className = "" }) => (
  <Icon className={className} width={width} height={height} strokeWidth={2}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </Icon>
);