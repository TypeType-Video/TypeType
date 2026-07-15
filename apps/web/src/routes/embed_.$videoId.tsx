import { createFileRoute } from "@tanstack/react-router";
import { EmbedPlayerShell } from "../components/embed-player-shell";
import { useAuth } from "../hooks/use-auth";
import { useInstance } from "../hooks/use-instance";
import { usePlaybackMode } from "../hooks/use-playback-mode";
import { useSettings } from "../hooks/use-settings";
import { MEMBER_ONLY_MESSAGE, useSabrBootstrap, useStream } from "../hooks/use-stream";
import { ApiError } from "../lib/api";
import { selectProgressiveWatchStream } from "../lib/progressive-watch-stream";
import { toPublicWatchParam, toWatchSourceUrl } from "../lib/watch-url";

type EmbedSearch = {
  t?: string | number;
  autoplay?: number;
};

function parseStartTime(raw?: string | number): number {
  if (raw == null) return 0;
  if (typeof raw === "number") return Math.max(0, raw);
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  const num = Number(trimmed);
  if (Number.isFinite(num)) return Math.max(0, num);
  const match = trimmed.match(/^(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s?)?$/);
  if (!match) return 0;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}

function EmbedLoading() {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <div className="aspect-video w-full max-w-[133.333vh]">
        <div className="w-full h-full bg-black rounded-lg" />
      </div>
    </div>
  );
}

function EmbedError({ message }: { message: string }) {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center px-4">
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-6 text-center">
        <p className="text-sm text-zinc-400">{message}</p>
      </div>
    </div>
  );
}

function EmbedAuthRequired({ watchUrl }: { watchUrl: string }) {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center px-4">
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-6 text-center">
        <h1 className="text-base font-semibold text-white">Embed unavailable</h1>
        <p className="text-sm text-zinc-400">
          This instance does not allow guest access, which is required for embedded playback.
        </p>
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex h-9 items-center rounded-lg bg-white px-4 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          Go to video
        </a>
      </div>
    </div>
  );
}

function EmbedPage() {
  const { videoId } = Route.useParams();
  const { t, autoplay } = Route.useSearch();
  const sourceUrl = toWatchSourceUrl(videoId);
  const watchUrl = `/watch?v=${encodeURIComponent(toPublicWatchParam(sourceUrl))}`;
  const { data: instance, isPending: instancePending } = useInstance();
  const { authReady, isAuthed } = useAuth();
  const { settings, settingsReady } = useSettings();
  const { playbackMode } = usePlaybackMode();
  const guestAllowed = instance?.guestAllowed ?? false;
  const useAuthenticatedStream =
    isAuthed && (settings.accessMode === "allow_list" || instance?.guestAllowed === false);
  const streamEnabled = (guestAllowed || isAuthed) && authReady && (!isAuthed || settingsReady);
  const streamQuery = useStream(sourceUrl, useAuthenticatedStream, streamEnabled, playbackMode);
  const bootstrap = useSabrBootstrap(
    sourceUrl,
    useAuthenticatedStream,
    streamEnabled,
    playbackMode,
  );
  const publicParam = toPublicWatchParam(sourceUrl);
  const activeStream = selectProgressiveWatchStream(
    streamQuery.isPlaceholderData ? undefined : streamQuery.data,
    playbackMode === "sabr" ? bootstrap.data : undefined,
    publicParam,
    [],
  );
  const startTime = parseStartTime(t) * 1000;
  const shouldAutoplay = autoplay === 1;

  if (instancePending || !instance) return <EmbedLoading />;

  if (!guestAllowed && !isAuthed) return <EmbedAuthRequired watchUrl={watchUrl} />;

  if (!activeStream) {
    const activeError = streamQuery.error ?? bootstrap.error;
    if (
      activeError instanceof ApiError &&
      (activeError.status === 401 || activeError.status === 403)
    ) {
      return <EmbedAuthRequired watchUrl={watchUrl} />;
    }
    const message =
      activeError instanceof ApiError && (activeError.status === 400 || activeError.status === 422)
        ? activeError.message
        : "Failed to load video.";
    return <EmbedError message={message} />;
  }

  if (activeStream.requiresMembership) {
    return <EmbedError message={MEMBER_ONLY_MESSAGE} />;
  }

  return (
    <EmbedPlayerShell
      stream={activeStream}
      sourceUrl={sourceUrl}
      startTime={startTime}
      autoplay={shouldAutoplay}
      isAuthed={isAuthed}
    />
  );
}

export const Route = createFileRoute("/embed_/$videoId")({
  validateSearch: (search: Record<string, unknown>): EmbedSearch => ({
    t: typeof search.t === "string" || typeof search.t === "number" ? search.t : undefined,
    autoplay: typeof search.autoplay === "number" ? search.autoplay : undefined,
  }),
  component: EmbedPage,
});
