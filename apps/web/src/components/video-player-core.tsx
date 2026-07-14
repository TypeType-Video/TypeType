import type * as dashjs from "dashjs";
import type Hls from "hls.js";
import { notifyDashPlayer, setDashPlayer } from "../lib/dash-player-store";
import type { MediaProviderAdapter } from "../lib/vidstack";
import { isDASHProvider, isHLSProvider, Track, useMediaState } from "../lib/vidstack";
import { useAuthStore } from "../stores/auth-store";

type DashRequestInterceptor = Parameters<dashjs.MediaPlayerClass["addRequestInterceptor"]>[0];

const DASH_TOP_QUALITY_BUFFER_SECONDS = 24;
const DASH_BACK_BUFFER_SECONDS = 30;
const HLS_FORWARD_BUFFER_SECONDS = 30;
const HLS_BACK_BUFFER_SECONDS = 30;
type DashLibraryModule = { default: typeof dashjs };
type DashRuntimeModule = typeof dashjs & { default?: typeof dashjs };
type HlsLibraryModule = { default: typeof Hls };
type HlsRuntimeModule = { default?: typeof Hls };
let dashLibrary: typeof dashjs | null = null;
let dashLibraryPromise: Promise<DashLibraryModule> | null = null;
let hlsLibraryPromise: Promise<HlsLibraryModule> | null = null;

const loadDashLibrary = (): Promise<DashLibraryModule> => {
  dashLibraryPromise ??= import("dashjs").then((module) => {
    const library = (module as DashRuntimeModule).default ?? module;
    dashLibrary = library;
    return { default: library };
  });
  return dashLibraryPromise;
};

const loadHlsLibrary = (): Promise<HlsLibraryModule> => {
  hlsLibraryPromise ??= import("hls.js").then((module) => ({
    default: (module as HlsRuntimeModule).default ?? (module as unknown as typeof Hls),
  }));
  return hlsLibraryPromise;
};

function configureDashPlayer(player: dashjs.MediaPlayerClass, library: typeof dashjs): void {
  const onDashUpdate = () => notifyDashPlayer();
  player.on(library.MediaPlayer.events.STREAM_INITIALIZED, onDashUpdate);
  player.on(library.MediaPlayer.events.TRACK_CHANGE_RENDERED, onDashUpdate);
  player.on(library.MediaPlayer.events.QUALITY_CHANGE_RENDERED, onDashUpdate);
  player.updateSettings({
    streaming: {
      buffer: {
        bufferTimeAtTopQuality: DASH_TOP_QUALITY_BUFFER_SECONDS,
        bufferTimeAtTopQualityLongForm: DASH_TOP_QUALITY_BUFFER_SECONDS,
        bufferToKeep: DASH_BACK_BUFFER_SECONDS,
      },
      cmcd: { enabled: false },
      retryAttempts: {
        MPD: 5,
        MediaSegment: 3,
        InitializationSegment: 3,
        IndexSegment: 3,
      },
      retryIntervals: {
        MPD: 500,
        MediaSegment: 500,
        InitializationSegment: 500,
        IndexSegment: 500,
      },
    },
  });
  notifyDashPlayer();
}

export function ChaptersTrack({ src }: { src: string }) {
  const duration = useMediaState("duration");
  if (!Number.isFinite(duration) || duration <= 0) return null;
  return <Track kind="chapters" src={src} default />;
}

export function onProviderChange(provider: MediaProviderAdapter | null) {
  if (isHLSProvider(provider)) {
    provider.library = loadHlsLibrary;
    provider.config = {
      backBufferLength: HLS_BACK_BUFFER_SECONDS,
      maxBufferLength: HLS_FORWARD_BUFFER_SECONDS,
      maxMaxBufferLength: HLS_FORWARD_BUFFER_SECONDS * 2,
    };
    return;
  }
  const dashProvider = isDASHProvider(provider);
  if (!dashProvider) {
    if (provider === null) setDashPlayer(null);
    return;
  }
  provider.library = loadDashLibrary;
  provider.onInstance((player) => {
    const addAuthHeader: DashRequestInterceptor = (request) => {
      const token = useAuthStore.getState().token;
      if (!token) return request;
      request.headers = {
        ...request.headers,
        Authorization: `Bearer ${token}`,
      };
      return request;
    };
    setDashPlayer(player);
    player.addRequestInterceptor(addAuthHeader);
    if (dashLibrary) configureDashPlayer(player, dashLibrary);
    else
      void loadDashLibrary().then(({ default: library }) => configureDashPlayer(player, library));
  });
}
