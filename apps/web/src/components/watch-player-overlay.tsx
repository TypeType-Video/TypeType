import type { RefObject } from "react";
import type { BulletCommentItem } from "../types/api";
import type { SettingsItem } from "../types/user";
import { DanmakuOverlay } from "./danmaku-overlay";
import { WatchPlayerDefaults } from "./watch-player-defaults";

type Props = {
  isNicoNico: boolean;
  hideComments: boolean;
  bulletCommentsOn: boolean;
  bulletComments: BulletCommentItem[] | undefined;
  positionRef: RefObject<number>;
  settings: SettingsItem;
  qualityFailed: boolean;
  originalAudioTrackId: string | null;
  preferredDefaultAudioTrackId: string | null;
  originalAudioLocale: string | null;
  onOriginalLanguageUnavailable: () => void;
};

export function WatchPlayerOverlay({
  isNicoNico,
  hideComments,
  bulletCommentsOn,
  bulletComments,
  positionRef,
  settings,
  qualityFailed,
  originalAudioTrackId,
  preferredDefaultAudioTrackId,
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
        originalAudioTrackId={originalAudioTrackId}
        preferredDefaultAudioTrackId={preferredDefaultAudioTrackId}
        originalAudioLocale={originalAudioLocale}
      />
    </>
  );
}
