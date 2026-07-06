import type { MediaContext, MediaType, Src, VideoProvider } from "./vidstack";
import { VideoProviderLoader } from "./vidstack";

export const SABR_VIDEO_TYPE = "video/object";

class SabrVideoLoader extends VideoProviderLoader {
  readonly name = "typetype-sabr";

  override canPlay(src: Src): boolean {
    return src.type === SABR_VIDEO_TYPE;
  }

  override mediaType(): MediaType {
    return "video";
  }

  override async load(ctx: MediaContext): Promise<VideoProvider> {
    const provider = await super.load(ctx);
    provider.loadSource = async (src: Src<string>) => {
      provider.video.querySelector("source[data-vds]")?.remove();
      provider.video.removeAttribute("src");
      provider.currentSrc = src;
    };
    return provider;
  }
}

export const SABR_VIDEO_LOADERS = [SabrVideoLoader];
