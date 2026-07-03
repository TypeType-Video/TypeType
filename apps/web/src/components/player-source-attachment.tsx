import { isSabrSessionSource } from "../lib/sabr-source";
import type { MediaSrc } from "../lib/vidstack";
import { SabrMediaSource } from "./sabr-media-source";

type Props = {
  src: MediaSrc;
  autoplay: boolean;
  onError: () => void;
};

export function PlayerSourceAttachment({ src, autoplay, onError }: Props) {
  if (isSabrSessionSource(src)) {
    return <SabrMediaSource src={src} autoplay={autoplay} onError={onError} />;
  }
  return null;
}
