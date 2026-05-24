import { createFileRoute } from "@tanstack/react-router";
import { PageSpinner } from "../components/page-spinner";
import { VideoGrid } from "../components/video-grid";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useWatchLaterStreams } from "../hooks/use-watch-later-streams";

function WatchLaterPage() {
  const { videos, count, isLoading } = useWatchLaterStreams();
  const { filter } = useBlockedFilter();

  if (isLoading) return <PageSpinner />;

  return (
    <div className="flex flex-col gap-6 [animation:page-fade-in_0.2s_ease-out]">
      <header>
        <h1 className="text-lg font-semibold text-fg">Watch later</h1>
        <p className="text-xs text-fg-soft">
          {count} video{count !== 1 ? "s" : ""}
        </p>
      </header>
      {videos.length === 0 ? (
        <p className="py-24 text-center text-sm text-fg-muted">No videos saved for later.</p>
      ) : (
        <VideoGrid streams={filter(videos)} />
      )}
    </div>
  );
}

export const Route = createFileRoute("/watch-later")({ component: WatchLaterPage });
