type NavItem = {
  label: string;
  to: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    to: "/",
    icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  },
  {
    label: "Shorts",
    to: "/shorts",
    icon: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="3" />
        <path d="M5 8h14" />
        <path d="M9 3v5" />
        <path d="M13 3v5" />
        <path d="M11 11l4 2.5-4 2.5V11z" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    label: "Subscriptions",
    to: "/subscriptions",
    icon: (
      <>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </>
    ),
  },
  {
    label: "History",
    to: "/history",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
  },
  {
    label: "Playlists",
    to: "/playlists",
    icon: (
      <>
        <path d="M3 5h15" />
        <path d="M3 9h15" />
        <path d="M3 13h9" />
        <path d="M15 13l4 3-4 3V13z" />
      </>
    ),
  },
  {
    label: "Import",
    to: "/import",
    icon: (
      <>
        <path d="M12 3v12" />
        <path d="M8 11l4 4 4-4" />
        <path d="M4 19h16" />
      </>
    ),
  },
  {
    label: "Settings",
    to: "/settings",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
  },
  {
    label: "Login",
    to: "/login",
    icon: (
      <>
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </>
    ),
  },
  {
    label: "Admin",
    to: "/admin-console",
    adminOnly: true,
    icon: (
      <>
        <path d="M12 2l7 3v6c0 5-3.5 9-7 11-3.5-2-7-6-7-11V5l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    label: "Privacy",
    to: "/privacy",
    icon: (
      <>
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <path d="M7 11V8a5 5 0 0 1 10 0v3" />
      </>
    ),
  },
];
