import { createFileRoute } from "@tanstack/react-router";
import { ContinueWatching } from "../components/continue-watching";
import { HomeFallbackSection } from "../components/home-fallback-section";
import { HomeRecommendationsSection } from "../components/home-recommendations-section";
import { useAuth } from "../hooks/use-auth";
import { useSettings } from "../hooks/use-settings";

function HomePage() {
  const { authReady, isAuthed } = useAuth();
  const { settings } = useSettings();
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
      <ContinueWatching />
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
