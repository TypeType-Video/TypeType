import * as dashjs from "dashjs";
import { notifyDashPlayer, setDashPlayer } from "../lib/dash-player-store";
import type { MediaProviderAdapter } from "../lib/vidstack";
import { isDASHProvider, Track, useMediaState } from "../lib/vidstack";

function shimDashjsQualityApi(player: dashjs.MediaPlayerClass): void {
  Reflect.set(
    player,
    "setQualityFor",
    (type: dashjs.MediaType, index: number, forceReplace = false) => {
      player.setRepresentationForTypeByIndex(type, index, forceReplace);
    },
  );
}

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
    setDashPlayer(player);
    const onDashUpdate = () => notifyDashPlayer();
    player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, onDashUpdate);
    player.on(dashjs.MediaPlayer.events.TRACK_CHANGE_RENDERED, onDashUpdate);
    player.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, onDashUpdate);
    player.updateSettings({ streaming: { cmcd: { enabled: false } } });
    shimDashjsQualityApi(player);
  });
}
