import {
  type MediaContext,
  type MediaProviderLoader,
  type MediaType,
  type Src,
  type VideoProvider,
  VideoProviderLoader,
} from "./vidstack";

const SABR_SRC_PREFIX = "typetype-sabr:";

class SabrVideoProviderLoader implements MediaProviderLoader<VideoProvider> {
  private readonly videoLoader = new VideoProviderLoader();
  private currentTarget: HTMLElement | null = null;
  readonly name = "typetype-sabr";

  get target(): HTMLElement | null {
    return this.currentTarget;
  }

  set target(target: HTMLElement | null) {
    this.currentTarget = target;
    if (target instanceof HTMLVideoElement) this.videoLoader.target = target;
  }

  canPlay(src: Src): boolean {
    return typeof src.src === "string" && src.src.startsWith(SABR_SRC_PREFIX);
  }

  mediaType(): MediaType {
    return "video";
  }

  async load(ctx: MediaContext): Promise<VideoProvider> {
    const provider = await this.videoLoader.load(ctx);
    provider.loadSource = async () => undefined;
    return provider;
  }
}

export const SABR_VIDEO_PROVIDER_LOADERS = [SabrVideoProviderLoader];

export function sabrMediaSrc(videoId: string): string {
  return `${SABR_SRC_PREFIX}${videoId}`;
}
