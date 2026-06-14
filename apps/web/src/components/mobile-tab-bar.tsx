import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useUiStore } from "../stores/ui-store";
import { NAV_ITEMS } from "./nav-items";

const BOTTOM_NAV_PATHS = ["/", "/subscriptions", "/history", "/playlists"];
const ITEM =
  "flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors";
const ACTIVE = "text-fg";
const INACTIVE = "text-fg-muted";

function TabIcon({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0"
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  );
}

export function MobileTabBar() {
  const openMobileSidebar = useUiStore((s) => s.openMobileSidebar);
  const mobileOpen = useUiStore((s) => s.mobileSidebarOpen);
  const items = NAV_ITEMS.filter((item) => BOTTOM_NAV_PATHS.includes(item.to));

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-30 flex items-stretch border-t border-border bg-app pb-[env(safe-area-inset-bottom)]"
    >
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={item.to === "/" ? { exact: true } : undefined}
          className={ITEM}
          activeProps={{ className: ACTIVE }}
          inactiveProps={{ className: INACTIVE }}
        >
          <TabIcon label={item.label}>{item.icon}</TabIcon>
          <span className="w-full truncate px-0.5 text-center">{item.label}</span>
        </Link>
      ))}
      <button
        type="button"
        onClick={openMobileSidebar}
        aria-label="Open menu"
        aria-expanded={mobileOpen}
        className={`${ITEM} ${mobileOpen ? ACTIVE : INACTIVE}`}
      >
        <Menu size={22} className="flex-shrink-0" aria-hidden />
        <span className="w-full truncate px-0.5 text-center">More</span>
      </button>
    </nav>
  );
}
