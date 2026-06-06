import { createFileRoute } from "@tanstack/react-router";
import { VideoGrid } from "../components/video-grid";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useFavoriteStreams } from "../hooks/use-favorite-streams";

function FavoritesPage() {
  const { videos, count, isLoading } = useFavoriteStreams();
  const { filter } = useBlockedFilter();

  return (
    <div className="flex flex-col gap-6 [animation:page-fade-in_0.2s_ease-out]">
      <header>
        <h1 className="text-lg font-semibold text-fg">Favorites</h1>
        <p className="text-xs text-fg-soft">
          {isLoading ? "Loading videos" : `${count} video${count !== 1 ? "s" : ""}`}
        </p>
      </header>
      {isLoading ? (
        <VideoGridSkeleton idPrefix="favorites" />
      ) : videos.length === 0 ? (
        <p className="py-24 text-center text-sm text-fg-muted">No favorites yet.</p>
      ) : (
        <VideoGrid streams={filter(videos)} />
      )}
    </div>
  );
}

export const Route = createFileRoute("/favorites")({ component: FavoritesPage });
