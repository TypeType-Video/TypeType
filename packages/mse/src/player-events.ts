import type { EventEmitter } from "./event-emitter";
import type { PlaybackResponse } from "./playback-client";
import type { LoadedSession } from "./session-loader";
import type { TypeTypeMseQuality } from "./types";

export function emitQuality(emitter: EventEmitter, quality: TypeTypeMseQuality): void {
  emitter.emit({
    type: "quality",
    videoItag: quality.videoItag,
    audioItag: quality.audioItag ?? null,
  });
}

export function emitManifest(
  emitter: EventEmitter,
  response: PlaybackResponse,
  session: LoadedSession,
): void {
  emitter.emit({
    type: "manifest",
    generation: response.generation,
    segmentCount: session.manifest.audio.segments.length + session.manifest.video.segments.length,
  });
}
