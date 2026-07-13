import { Link, useRouterState } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { useAuthToasts } from "../hooks/use-auth-toasts";
import { useMobile } from "../hooks/use-mobile";
import { useSearchShortcut } from "../hooks/use-search-shortcut";
import { isAuthPage } from "../lib/auth-routes";
import { useUiStore } from "../stores/ui-store";
import { NavbarAccountControls } from "./navbar-account-controls";
import { NavbarLeadingControl } from "./navbar-leading-control";
import { NavbarNotifications } from "./navbar-notifications";
import { NavbarPlaybackMode } from "./navbar-playback-mode";
import { NavbarSearch } from "./navbar-search";
import { Toast } from "./toast";

const SearchOverlay = lazy(() =>
  import("./search-overlay").then((module) => ({
    default: module.SearchOverlay,
  })),
);

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const toast = useAuthToasts();
  const isMobile = useMobile();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const toggleMobileSidebar = useUiStore((s) => s.toggleMobileSidebar);
  const { status, isAuthed, isGuest, isAdmin, me, signOut } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const authPage = isAuthPage(pathname);
  const canOpenSearch = !authPage;
  const showBackButton = isMobile && canOpenSearch && pathname !== "/";
  const navClass = isMobile
    ? "fixed top-0 left-0 right-0 z-50 h-14 bg-app/95 backdrop-blur border-b border-border flex items-center px-2 gap-2"
    : "fixed top-0 left-0 right-0 z-50 h-14 bg-app/95 backdrop-blur border-b border-border flex items-center px-4 gap-4";

  function handleBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.assign("/");
  }

  useSearchShortcut({ enabled: canOpenSearch && isMobile, onOpen: () => setSearchOpen(true) });

  return (
    <>
      <nav className={navClass}>
        <div className="flex min-w-0 items-center gap-2">
          <NavbarLeadingControl
            authPage={authPage}
            showBackButton={showBackButton}
            onBack={handleBack}
            onToggleSidebar={isMobile ? toggleMobileSidebar : toggleSidebar}
          />
          <Link to="/" className="flex min-w-0 shrink items-center gap-2">
            <img src="/logo.svg" alt="TypeType" width={28} height={28} />
            <span className="max-w-28 truncate text-fg text-sm font-semibold tracking-widest sm:max-w-none">
              TYPETYPE
            </span>
          </Link>
        </div>

        {canOpenSearch && isMobile && (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-strong bg-surface-strong text-fg hover:bg-surface-soft"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        )}

        {canOpenSearch && !isMobile && <NavbarSearch />}

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <NavbarPlaybackMode />
          <NavbarNotifications />
          <NavbarAccountControls
            status={status}
            isAuthed={isAuthed}
            isGuest={isGuest}
            isAdmin={isAdmin}
            me={me}
            isMobile={isMobile}
            signOut={signOut}
          />
        </div>
      </nav>
      {searchOpen && canOpenSearch && (
        <Suspense fallback={null}>
          <SearchOverlay onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
      <Toast message={toast} />
    </>
  );
}
