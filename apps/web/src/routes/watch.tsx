import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef } from "react";
import { StreamError } from "../components/stream-error";
import { WatchPageSkeleton } from "../components/watch-page-skeleton";
import { useAuth } from "../hooks/use-auth";
import { useDocumentTitle } from "../hooks/use-document-title";
import { useHistory } from "../hooks/use-history";
import { useInstance } from "../hooks/use-instance";
import { usePlaybackMode } from "../hooks/use-playback-mode";
import { useProgress } from "../hooks/use-progress";
import { useSettings } from "../hooks/use-settings";
import {
  isMemberOnlyApiError,
  isStreamUnavailableError,
  MEMBER_ONLY_MESSAGE,
  useSabrBootstrap,
  useStream,
} from "../hooks/use-stream";
import { FAMILY_LIST_BLOCKED_MESSAGE, isChannelNotAllowedError } from "../lib/allow-list-error";
import { ApiError } from "../lib/api";
import { isYoutubeSessionReconnectError } from "../lib/api-youtube-session";
import { selectProgressiveWatchStream } from "../lib/progressive-watch-stream";
import { toPublicWatchParam, toWatchSourceUrl } from "../lib/watch-url";
import { youtubeSessionReturnToForWatch } from "../lib/youtube-session-route";
import { useWatchNavigationStore } from "../stores/watch-navigation-store";

const WatchLayout = lazy(() =>
  import("../components/watch-layout").then((module) => ({ default: module.WatchLayout })),
);

function WatchPage() {
  const { v, list, shuffle } = Route.useSearch();
  const navigate = useNavigate({ from: "/watch" });
  const sourceUrl = toWatchSourceUrl(v);
  const publicParam = toPublicWatchParam(sourceUrl);
  const { authReady, isAuthed } = useAuth();
  const { data: instance, isPending: instancePending } = useInstance();
  const { settings, settingsReady } = useSettings();
  const navigationSnapshot = useWatchNavigationStore((state) => state.snapshot);
  const { playbackMode } = usePlaybackMode();
  const useAuthenticatedStream =
    isAuthed && (settings.accessMode === "allow_list" || instance?.guestAllowed === false);
  const streamEnabled = authReady && !instancePending && (!isAuthed || settingsReady);
  const streamQuery = useStream(sourceUrl, useAuthenticatedStream, streamEnabled, playbackMode);
  const bootstrap = useSabrBootstrap(
    sourceUrl,
    useAuthenticatedStream,
    streamEnabled,
    playbackMode,
  );
  const { add } = useHistory();
  const progressFetch = useProgress(sourceUrl);
  const previewMatches =
    navigationSnapshot && toPublicWatchParam(navigationSnapshot.stream.id) === publicParam;
  const previewStream = previewMatches ? navigationSnapshot.stream : undefined;
  const previewRelated = previewMatches ? navigationSnapshot.relatedStreams : [];
  const activeStream = selectProgressiveWatchStream(
    streamQuery.isPlaceholderData ? undefined : streamQuery.data,
    playbackMode === "sabr" ? bootstrap.data : undefined,
    publicParam,
    previewRelated,
  );
  useDocumentTitle(activeStream?.title ?? previewStream?.title);
  const loadingPage = (
    <WatchPageSkeleton
      stream={previewStream}
      relatedStreams={previewRelated}
      videoUrl={sourceUrl}
      showComments={!settings.hideComments}
    />
  );

  const addToHistoryRef = useRef(add.mutate);
  addToHistoryRef.current = add.mutate;
  const historyAddedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (v.trim() && publicParam !== v.trim()) {
      navigate({ search: (prev) => ({ ...prev, v: publicParam }), replace: true });
    }
  }, [navigate, publicParam, v]);

  useEffect(() => {
    if (!activeStream) return;
    if (historyAddedForRef.current === activeStream.id) return;
    const historyPositionMs =
      progressFetch.data?.position ?? (activeStream.startPosition ?? 0) * 1000;
    const progress = Math.max(0, Math.round(historyPositionMs / 1000));
    historyAddedForRef.current = activeStream.id;
    addToHistoryRef.current({
      url: activeStream.id,
      title: activeStream.title,
      thumbnail: activeStream.rawThumbnail,
      channelName: activeStream.channelName,
      channelUrl: activeStream.channelUrl ?? "",
      channelAvatar: activeStream.rawChannelAvatar,
      duration: activeStream.duration,
      publishedAt: activeStream.publishedAt,
      viewCount: activeStream.views,
      progress,
    });
  }, [activeStream, progressFetch.data?.position]);

  const pending = streamQuery.isLoading || bootstrap.isLoading;
  if (!activeStream && (!streamEnabled || pending)) return loadingPage;

  if (!activeStream) {
    const activeError = streamQuery.error ?? bootstrap.error;
    const genericExtractorError =
      activeError instanceof ApiError &&
      activeError.status === 422 &&
      activeError.message ===
        "Error occurs when fetching the page. Try increase the loading timeout in Settings.";
    const isMemberOnlyError = isMemberOnlyApiError(activeError) || genericExtractorError;
    const needsYoutubeSession = isYoutubeSessionReconnectError(activeError);
    const familyListBlocked = isChannelNotAllowedError(activeError);
    const youtubeSessionReturnTo = needsYoutubeSession
      ? youtubeSessionReturnToForWatch(publicParam, list, shuffle)
      : undefined;
    const message = isMemberOnlyError
      ? MEMBER_ONLY_MESSAGE
      : familyListBlocked
        ? FAMILY_LIST_BLOCKED_MESSAGE
        : needsYoutubeSession
          ? "Connect YouTube to load this browser-only video."
          : activeError instanceof ApiError &&
              (activeError.status === 400 || activeError.status === 422)
            ? activeError.message
            : isStreamUnavailableError(activeError)
              ? "This video is currently unavailable"
              : "Failed to load stream.";
    return (
      <StreamError
        message={message}
        onRetry={
          needsYoutubeSession || familyListBlocked
            ? undefined
            : () => {
                void streamQuery.refetch();
                void bootstrap.refetch();
              }
        }
        youtubeSessionReturnTo={youtubeSessionReturnTo}
      />
    );
  }

  if (activeStream.requiresMembership) {
    return <StreamError message={MEMBER_ONLY_MESSAGE} />;
  }

  const savedPosition = progressFetch.data?.position ?? 0;
  const serverPositionMs = (activeStream.startPosition ?? 0) * 1000;
  const resumeMs = savedPosition > 0 ? savedPosition : serverPositionMs;
  const durationMs = activeStream.duration * 1000;
  const startTime = resumeMs >= 5000 && resumeMs < durationMs * 0.95 ? resumeMs : 0;
  const navigating = toPublicWatchParam(activeStream.id) !== publicParam;

  return (
    <Suspense
      fallback={
        <WatchPageSkeleton
          stream={activeStream}
          relatedStreams={activeStream.related}
          videoUrl={sourceUrl}
          showComments={!settings.hideComments}
        />
      }
    >
      <WatchLayout
        key={activeStream.id}
        stream={activeStream}
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
