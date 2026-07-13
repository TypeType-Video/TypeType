import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ContinueWatching } from "../components/continue-watching";
import { HomeFallbackSection } from "../components/home-fallback-section";
import { HomeRecommendationsSection } from "../components/home-recommendations-section";
import { useAuth } from "../hooks/use-auth";
import { useSettings } from "../hooks/use-settings";

let landingApplied = false;

function landingPath(value: string) {
  switch (value) {
    case "subscriptions":
      return "/subscriptions";
    case "history":
      return "/history";
    case "playlists":
      return "/playlists";
    case "watch-later":
      return "/watch-later";
    case "favorites":
      return "/favorites";
    default:
      return null;
  }
}

function HomePage() {
  const { authReady, isAuthed } = useAuth();
  const { settings, settingsReady } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    if (landingApplied || !settingsReady) return;
    landingApplied = true;
    const target = landingPath(settings.defaultLandingPage);
    if (target) navigate({ to: target, replace: true });
  }, [settingsReady, settings.defaultLandingPage, navigate]);

  if (!authReady) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-sm text-fg-muted">Loading session...</p>
      </div>
    );
  }
  const title = isAuthed ? "Recommended" : "Trending";
  const showRecommendations = !isAuthed || !settings.hideHomeRecommendations;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {!settings.hideContinueWatching && <ContinueWatching />}
      {showRecommendations && (
        <section className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-soft">{title}</p>
          {isAuthed ? <HomeRecommendationsSection /> : <HomeFallbackSection />}
        </section>
      )}
    </div>
  );
}

export const Route = createFileRoute("/")({ component: HomePage });
