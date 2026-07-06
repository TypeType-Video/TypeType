import { isSabrSessionSource } from "../lib/sabr-source";
import type { MediaSrc } from "../lib/vidstack";
import { SabrMediaSource } from "./sabr-media-source";

type Props = {
  src: MediaSrc;
  startTime: number;
  autoplay: boolean;
  onError: () => void;
};

export function PlayerSourceAttachment({ src, startTime, autoplay, onError }: Props) {
  if (isSabrSessionSource(src)) {
    return (
      <SabrMediaSource src={src} startTime={startTime} autoplay={autoplay} onError={onError} />
    );
  }
  return null;
}
