import { useEffect, useState } from "react";
import { isIosDevice } from "../lib/ios-device";
import type { MediaSrc } from "../lib/vidstack";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
  MediaPlayer,
  MediaProvider,
  Track,
} from "../lib/vidstack";
import type { SubtitleItem } from "../types/api";
import { AudioTrackSelector } from "./audio-track-selector";
import { MediaSessionSync } from "./media-session-sync";
import { PlayerDefaults } from "./player-defaults";
import { buildSafeSubtitleTracks } from "./subtitle-track-utils";
import { Toast } from "./toast";
import { onProviderChange } from "./video-player-core";
import { VolumeRestorer } from "./volume-restorer";

type Props = {
  src: MediaSrc;
  title?: string;
  poster?: string;
  subtitles?: SubtitleItem[];
  initialVolume?: number;
  initialMuted?: boolean;
  settingsReady?: boolean;
  autoplay?: boolean;
  defaultAudioLanguage?: string;
  preferOriginalLanguage?: boolean;
  originalAudioTrackId?: string | null;
  preferredDefaultAudioTrackId?: string | null;
  originalAudioLocale?: string | null;
  defaultSubtitleLanguage?: string;
  subtitlesEnabled?: boolean;
  onVolumeChange?: (volume: number, muted: boolean) => void;
  onError?: () => void;
  onEnded?: () => void;
};

export function ShortsVideoPlayer({
  src,
  title,
  poster,
  subtitles,
  initialVolume = 1,
  initialMuted = false,
  settingsReady = false,
  autoplay = true,
  defaultAudioLanguage,
  preferOriginalLanguage,
  originalAudioTrackId,
  preferredDefaultAudioTrackId,
  originalAudioLocale,
  defaultSubtitleLanguage,
  subtitlesEnabled,
  onVolumeChange,
  onError,
  onEnded,
}: Props) {
  const ios = isIosDevice();
  const srcKey = typeof src === "string" ? src : String(src.src);
  const subtitleTracks = buildSafeSubtitleTracks(subtitles);
  const shouldPreferOriginalLanguage = preferOriginalLanguage ?? true;
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "black" }}>
      <MediaPlayer
        key={srcKey}
        src={src}
        title={title}
        poster={poster}
        viewType="video"
        streamType="on-demand"
        logLevel="warn"
        crossOrigin
        playsInline
        {...(ios ? { "webkit-playsinline": "true" } : {})}
        autoPlay={autoplay}
        storage={null}
        onProviderChange={onProviderChange}
        onError={() => onError?.()}
        onEnded={() => onEnded?.()}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          "--media-object-fit": "cover",
        }}
      >
        <MediaProvider
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          mediaProps={{
            style: {
              position: "absolute",
              inset: "0",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            },
          }}
        >
          {subtitleTracks.map((s) => (
            <Track
              key={s.key}
              kind="subtitles"
              src={s.src}
              label={s.label}
              lang={s.lang}
              type="vtt"
            />
          ))}
        </MediaProvider>
        <DefaultVideoLayout
          icons={defaultLayoutIcons}
          translations={{ Captions: "Subtitles" }}
          smallLayoutWhen
          noModal
          menuContainer="body"
          menuGroup="bottom"
          slots={{
            settingsMenuItemsStart: <AudioTrackSelector />,
          }}
        />
        <PlayerDefaults
          defaultAudioLanguage={defaultAudioLanguage || undefined}
          preferOriginalLanguage={shouldPreferOriginalLanguage}
          requireOriginalLanguage
          onOriginalLanguageUnavailable={() => {
            setToast("Original audio unavailable");
          }}
          originalAudioTrackId={originalAudioTrackId}
          preferredDefaultAudioTrackId={preferredDefaultAudioTrackId}
          originalAudioLocale={originalAudioLocale}
          defaultSubtitleLanguage={defaultSubtitleLanguage}
          subtitlesEnabled={subtitlesEnabled}
        />
        <VolumeRestorer
          initialVolume={initialVolume}
          initialMuted={initialMuted}
          settingsReady={settingsReady}
          onVolumeChange={onVolumeChange}
        />
        <MediaSessionSync title={title} artwork={poster} />
      </MediaPlayer>
      <Toast message={toast} />
    </div>
  );
}
