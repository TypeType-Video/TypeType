import type { RefObject } from "react";
import { getOriginalAudioTrackId, getPreferredDefaultAudioTrackId } from "../lib/audio-track";
import type { BulletCommentItem } from "../types/api";
import type { VideoStream } from "../types/stream";
import type { SettingsItem } from "../types/user";
import { DanmakuOverlay } from "./danmaku-overlay";
import { WatchPlayerDefaults } from "./watch-player-defaults";

type Props = {
  isNicoNico: boolean;
  hideComments: boolean;
  bulletCommentsOn: boolean;
  bulletComments: BulletCommentItem[] | undefined;
  positionRef: RefObject<number>;
  stream: VideoStream;
  settings: SettingsItem;
  qualityFailed: boolean;
  originalAudioLocale: string | null;
  onOriginalLanguageUnavailable: () => void;
};

export function WatchPlayerOverlay({
  isNicoNico,
  hideComments,
  bulletCommentsOn,
  bulletComments,
  positionRef,
  stream,
  settings,
  qualityFailed,
  originalAudioLocale,
  onOriginalLanguageUnavailable,
}: Props) {
  return (
    <>
      {isNicoNico && !hideComments && bulletCommentsOn && bulletComments && (
        <DanmakuOverlay comments={bulletComments} positionRef={positionRef} />
      )}
      <WatchPlayerDefaults
        settings={settings}
        qualityFailed={qualityFailed}
        onOriginalLanguageUnavailable={onOriginalLanguageUnavailable}
        originalAudioTrackId={getOriginalAudioTrackId(stream)}
        preferredDefaultAudioTrackId={getPreferredDefaultAudioTrackId(stream)}
        originalAudioLocale={originalAudioLocale}
      />
    </>
  );
}
