import type { MediaContext, MediaProviderAdapter } from "@vidstack/react";
import {
  AudioProviderLoader,
  DASHProviderLoader,
  HLSProviderLoader,
  VideoProviderLoader,
} from "@vidstack/react";

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

export function patchVidstackProviderLoaders() {
  if (globalThis.typetypeVidstackProviderLoadersPatched) return;
  globalThis.typetypeVidstackProviderLoadersPatched = true;
  patchLoader(AudioProviderLoader);
  patchLoader(VideoProviderLoader);
  patchLoader(HLSProviderLoader);
  patchLoader(DASHProviderLoader);
}
