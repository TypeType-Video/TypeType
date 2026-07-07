import * as dashjs from "dashjs";
import { notifyDashPlayer, setDashPlayer } from "../lib/dash-player-store";
import type { MediaProviderAdapter } from "../lib/vidstack";
import { isDASHProvider, Track, useMediaState } from "../lib/vidstack";
import { useAuthStore } from "../stores/auth-store";

type DashRequestInterceptor = Parameters<dashjs.MediaPlayerClass["addRequestInterceptor"]>[0];

const DASH_TOP_QUALITY_BUFFER_SECONDS = 24;
const DASH_BACK_BUFFER_SECONDS = 30;

export function ChaptersTrack({ src }: { src: string }) {
  const duration = useMediaState("duration");
  if (!Number.isFinite(duration) || duration <= 0) return null;
  return <Track kind="chapters" src={src} default />;
}

export function onProviderChange(provider: MediaProviderAdapter | null) {
  const dashProvider = isDASHProvider(provider);
  if (!dashProvider) {
    if (provider === null) setDashPlayer(null);
    return;
  }
  provider.library = dashjs.MediaPlayer;
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
    const onDashUpdate = () => notifyDashPlayer();
    player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, onDashUpdate);
    player.on(dashjs.MediaPlayer.events.TRACK_CHANGE_RENDERED, onDashUpdate);
    player.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, onDashUpdate);
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
  });
}
