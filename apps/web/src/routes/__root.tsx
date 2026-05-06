import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Navbar } from "../components/navbar";
import { Sidebar } from "../components/sidebar";
import { useAuth } from "../hooks/use-auth";
import { useMobile } from "../hooks/use-mobile";
import { useSessionActivityReporting } from "../hooks/use-session-activity-reporting";
import { isAdminRoute, isAuthPage, requiresAuth } from "../lib/auth-routes";
import { bootstrapSession } from "../lib/auth-session";
import { applyTheme } from "../lib/theme";
import { useThemeStore } from "../stores/theme-store";
import { useUiStore } from "../stores/ui-store";
import { useWatchLayoutStore } from "../stores/watch-layout-store";

function AuthShell() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-app via-surface to-app text-fg">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-sky-700/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>
      <main className="relative z-10 min-h-screen px-4 py-8 flex items-center justify-center">
        <Outlet />
      </main>
    </div>
  );
}

function RootLayout() {
  const isMobile = useMobile();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const closeMobileSidebar = useUiStore((s) => s.closeMobileSidebar);
  const theme = useThemeStore((s) => s.theme);
  const cinemaMode = useWatchLayoutStore((s) => s.cinemaMode);
  const { isAuthed, isAdmin, status } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const shortsPage = pathname === "/shorts";
  const watchCinemaPage = pathname === "/watch" && cinemaMode;
  useSessionActivityReporting();

  useEffect(() => {
    void bootstrapSession();
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const loader = document.getElementById("app-loader");
    if (!loader) return;
    loader.remove();
  }, []);

  useEffect(() => {
    if (!isMobile) closeMobileSidebar();
  }, [isMobile, closeMobileSidebar]);

  useEffect(() => {
    if (status === "loading") return;
    if (!isAuthed && isAdminRoute(pathname)) {
      const redirect = encodeURIComponent(pathname);
      window.location.replace(`/login?redirect=${redirect}`);
      return;
    }
    if (!isAuthed && requiresAuth(pathname)) {
      const redirect = encodeURIComponent(pathname);
      window.location.replace(`/login?redirect=${redirect}`);
      return;
    }
    if (isAdminRoute(pathname) && !isAdmin) {
      window.location.replace("/");
      return;
    }
  }, [isAuthed, isAdmin, status, pathname]);

  if (status === "loading" && (requiresAuth(pathname) || isAdminRoute(pathname))) {
    return (
      <div className="min-h-screen bg-app text-fg flex items-center justify-center">
        <p className="text-sm text-fg-muted">Loading session...</p>
      </div>
    );
  }

  const authPage = isAuthPage(pathname);

  if (authPage) {
    return <AuthShell />;
  }

  if (shortsPage) {
    return (
      <div className="min-h-screen bg-app text-fg">
        <Navbar />
        <Sidebar />
        <main style={{ paddingTop: "calc(3.5rem + env(safe-area-inset-top, 0px))" }}>
          <Outlet />
        </main>
      </div>
    );
  }

  const topPadding = { paddingTop: "calc(3.5rem + env(safe-area-inset-top, 0px))" };
  const mainClasses = watchCinemaPage
    ? `transition-all duration-200 ${isMobile ? "ml-0" : collapsed ? "ml-14" : "ml-48"}`
    : `px-3 sm:px-4 pb-5 sm:pb-6 transition-all duration-200 ${
        isMobile ? "ml-0" : collapsed ? "ml-14" : "ml-48"
      }`;

  return (
    <div className="min-h-screen bg-app text-fg">
      <Navbar />
      <Sidebar />
      <main className={mainClasses} style={topPadding}>
        <Outlet />
      </main>
    </div>
  );
}

export const Route = createRootRoute({ component: RootLayout });
