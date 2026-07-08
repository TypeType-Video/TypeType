import {
  type MediaContext,
  type MediaProviderLoader,
  type MediaType,
  type Src,
  VideoProvider,
} from "./vidstack";

const SABR_SRC_PREFIX = "typetype-sabr:";

class SabrVideoProvider extends VideoProvider {
  override async loadSource(): Promise<void> {}
}

class SabrVideoProviderLoader implements MediaProviderLoader<SabrVideoProvider> {
  readonly name = "typetype-sabr";
  target: HTMLElement | null = null;

  canPlay(src: Src): boolean {
    return typeof src.src === "string" && src.src.startsWith(SABR_SRC_PREFIX);
  }

  mediaType(): MediaType {
    return "video";
  }

  async load(ctx: MediaContext): Promise<SabrVideoProvider> {
    if (!(this.target instanceof HTMLVideoElement)) {
      throw new Error("SABR provider requires a video element");
    }
    return new SabrVideoProvider(this.target, ctx);
  }
}

export const SABR_VIDEO_PROVIDER_LOADERS = [SabrVideoProviderLoader];

export function sabrMediaSrc(videoId: string): string {
  return `${SABR_SRC_PREFIX}${videoId}`;
}
