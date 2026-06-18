import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef } from "react";
import { PageSpinner } from "../components/page-spinner";
import { StreamError } from "../components/stream-error";
import { useAuth } from "../hooks/use-auth";
import { useDocumentTitle } from "../hooks/use-document-title";
import { useHistory } from "../hooks/use-history";
import { useProgress } from "../hooks/use-progress";
import {
  isMemberOnlyApiError,
  isStreamUnavailableError,
  MEMBER_ONLY_MESSAGE,
  useStream,
} from "../hooks/use-stream";
import { ApiError } from "../lib/api";
import { isYoutubeSessionReconnectError } from "../lib/api-youtube-session";
import { toPublicWatchParam, toWatchSourceUrl } from "../lib/watch-url";
import { youtubeSessionReturnToForWatch } from "../lib/youtube-session-route";

const WatchLayout = lazy(() =>
  import("../components/watch-layout").then((module) => ({ default: module.WatchLayout })),
);

function PlayerOnlyLoader() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start [animation:page-fade-in_0.2s_ease-out]">
      <div className="flex-[2] min-w-0 max-w-[133.333vh] flex flex-col gap-4">
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          <PageSpinner fullScreen={false} />
        </div>
      </div>
      <div className="w-full lg:flex-1 lg:min-w-64" />
    </div>
  );
}

function WatchPage() {
  const { v, list, shuffle } = Route.useSearch();
  const navigate = useNavigate({ from: "/watch" });
  const sourceUrl = toWatchSourceUrl(v);
  const publicParam = toPublicWatchParam(sourceUrl);
  const { authReady, isAuthed } = useAuth();
  const { data: stream, isLoading, isError, error, refetch } = useStream(sourceUrl);
  const { add } = useHistory();
  const progressFetch = useProgress(sourceUrl);
  useDocumentTitle(stream?.title);

  const addToHistoryRef = useRef(add.mutate);
  addToHistoryRef.current = add.mutate;
  const historyAddedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (v.trim() && publicParam !== v.trim()) {
      navigate({ search: (prev) => ({ ...prev, v: publicParam }), replace: true });
    }
  }, [navigate, publicParam, v]);

  useEffect(() => {
    if (!stream) return;
    if (authReady && isAuthed && progressFetch.isPending) return;
    if (historyAddedForRef.current === stream.id) return;
    const historyPositionMs = progressFetch.data?.position ?? (stream.startPosition ?? 0) * 1000;
    const progress = Math.max(0, Math.round(historyPositionMs / 1000));
    historyAddedForRef.current = stream.id;
    addToHistoryRef.current({
      url: stream.id,
      title: stream.title,
      thumbnail: stream.rawThumbnail,
      channelName: stream.channelName,
      channelUrl: stream.channelUrl ?? "",
      channelAvatar: stream.rawChannelAvatar,
      duration: stream.duration,
      progress,
    });
  }, [authReady, isAuthed, progressFetch.data?.position, progressFetch.isPending, stream]);

  if (isLoading && !stream) return <PlayerOnlyLoader />;
  if (!authReady) return <PlayerOnlyLoader />;
  if (isAuthed && progressFetch.isPending) return <PlayerOnlyLoader />;

  if (isError || !stream) {
    const genericExtractorError =
      error instanceof ApiError &&
      error.status === 422 &&
      error.message ===
        "Error occurs when fetching the page. Try increase the loading timeout in Settings.";
    const isMemberOnlyError = isMemberOnlyApiError(error) || genericExtractorError;
    const needsYoutubeSession = isYoutubeSessionReconnectError(error);
    const youtubeSessionReturnTo = needsYoutubeSession
      ? youtubeSessionReturnToForWatch(publicParam, list, shuffle)
      : undefined;
    const message = isMemberOnlyError
      ? MEMBER_ONLY_MESSAGE
      : needsYoutubeSession
        ? "Connect YouTube to load this browser-only video."
        : error instanceof ApiError && (error.status === 400 || error.status === 422)
          ? error.message
          : isStreamUnavailableError(error)
            ? "This video is currently unavailable"
            : "Failed to load stream.";
    return (
      <StreamError
        message={message}
        onRetry={
          needsYoutubeSession
            ? undefined
            : () => {
                void refetch();
              }
        }
        youtubeSessionReturnTo={youtubeSessionReturnTo}
      />
    );
  }

  if (stream.requiresMembership) {
    return <StreamError message={MEMBER_ONLY_MESSAGE} />;
  }

  const savedPosition = progressFetch.data?.position ?? 0;
  const serverPositionMs = (stream.startPosition ?? 0) * 1000;
  const resumeMs = savedPosition > 0 ? savedPosition : serverPositionMs;
  const durationMs = stream.duration * 1000;
  const startTime = resumeMs >= 5000 && resumeMs < durationMs * 0.95 ? resumeMs : 0;
  const navigating = toPublicWatchParam(stream.id) !== publicParam;

  return (
    <Suspense fallback={<PlayerOnlyLoader />}>
      <WatchLayout
        stream={stream}
        startTime={startTime}
        currentParam={publicParam}
        navigating={navigating}
        list={list}
        shuffle={shuffle}
      />
    </Suspense>
  );
}

export const Route = createFileRoute("/watch")({
  validateSearch: (search: Record<string, unknown>) => ({
    v: typeof search.v === "string" ? search.v.trim() : "",
    ...(typeof search.list === "string" && search.list ? { list: search.list } : {}),
    ...(typeof search.shuffle === "string" && search.shuffle ? { shuffle: search.shuffle } : {}),
  }),
  component: WatchPage,
});
