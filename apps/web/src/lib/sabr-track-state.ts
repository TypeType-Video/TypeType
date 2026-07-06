import type { SabrFormatDescriptor } from "../types/sabr";
import type { SabrTrackState } from "./sabr-mse-utils";
import { SabrSourceBufferQueue } from "./sabr-source-buffer-queue";

export function createSabrTrack(source: MediaSource, format: SabrFormatDescriptor): SabrTrackState {
  return {
    format,
    queue: new SabrSourceBufferQueue(source.addSourceBuffer(format.mimeType)),
  };
}
