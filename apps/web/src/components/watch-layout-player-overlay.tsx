import type { RefObject } from "react";
import { getOriginalAudioLocale } from "../lib/audio-track";
import type { BulletCommentItem } from "../types/api";
import type { VideoStream } from "../types/stream";
import type { SettingsItem } from "../types/user";
import { WatchPlayerOverlay } from "./watch-player-overlay";

type Props = {
  isNicoNico: boolean;
  hideComments: boolean;
  bulletCommentsOn: boolean;
  bulletComments: BulletCommentItem[] | undefined;
  positionRef: RefObject<number>;
  stream: VideoStream;
  settings: SettingsItem;
  qualityFailed: boolean;
  onOriginalLanguageUnavailable: () => void;
};

export function WatchLayoutPlayerOverlay(props: Props) {
  return (
    <WatchPlayerOverlay
      isNicoNico={props.isNicoNico}
      hideComments={props.hideComments}
      bulletCommentsOn={props.bulletCommentsOn}
      bulletComments={props.bulletComments}
      positionRef={props.positionRef}
      stream={props.stream}
      settings={props.settings}
      qualityFailed={props.qualityFailed}
      onOriginalLanguageUnavailable={props.onOriginalLanguageUnavailable}
      originalAudioLocale={getOriginalAudioLocale(props.stream)}
    />
  );
}
