import type { MediaContext, MediaProviderAdapter } from "@vidstack/react";
import {
  AudioProviderLoader,
  DASHProviderLoader,
  HLSProviderLoader,
  VideoProviderLoader,
} from "@vidstack/react";
import { SABR_BLOB_TYPE } from "./sabr-vidstack-loader";

type Loader = AudioProviderLoader | VideoProviderLoader | HLSProviderLoader | DASHProviderLoader;
type LoaderConstructor<T extends Loader> = new () => T;

declare global {
  var typetypeVidstackProviderLoadersPatched: boolean | undefined;
}

function patchLoader<T extends Loader>(LoaderClass: LoaderConstructor<T>) {
  const originalLoad = LoaderClass.prototype.load;
  LoaderClass.prototype.load = function load(context: MediaContext): Promise<MediaProviderAdapter> {
    const target = this.target;
    if (!target) return originalLoad.call(this, context);
    const stableLoader = new LoaderClass();
    stableLoader.target = target;
    return originalLoad.call(stableLoader, context);
  };
}

function patchVideoCanPlay() {
  const originalCanPlay = VideoProviderLoader.prototype.canPlay;
  VideoProviderLoader.prototype.canPlay = function canPlay(
    src: Parameters<VideoProviderLoader["canPlay"]>[0],
  ): boolean {
    if (src.src instanceof Blob && src.src.type === SABR_BLOB_TYPE) return false;
    return originalCanPlay.call(this, src);
  };
}

export function patchVidstackProviderLoaders() {
  if (globalThis.typetypeVidstackProviderLoadersPatched) return;
  globalThis.typetypeVidstackProviderLoadersPatched = true;
  patchVideoCanPlay();
  patchLoader(AudioProviderLoader);
  patchLoader(VideoProviderLoader);
  patchLoader(HLSProviderLoader);
  patchLoader(DASHProviderLoader);
}
