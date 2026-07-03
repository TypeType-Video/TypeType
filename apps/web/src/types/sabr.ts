export type SabrFormatDescriptor = {
  itag: number;
  mimeType: string;
  bitrate: number;
  endSegment: number;
  approxDurationMs: number;
  qualityLabel: string | null;
  audioTrackId: string | null;
  audioTrackName: string | null;
  init: string;
  segment: string;
};

export type SabrSessionDescriptor = {
  videoId: string;
  session: string;
  transport: "stateful-websocket";
  protocol: "typetype-sabr-ws-v1";
  maxBinaryFrameBytes: number;
  durationMs: number;
  audio: SabrFormatDescriptor;
  video: SabrFormatDescriptor;
  endpoints: {
    webSocket: string;
    audioInit: string;
    videoInit: string;
    legacySegmentTemplate: string;
  };
};

export type SabrSourceConfig = {
  id: string;
  descriptorUrl: string;
  videoItag: number;
  audioItag: number | null;
  durationMs: number;
  qualities: SabrQualityOption[];
};

export type SabrQualityOption = {
  itag: number;
  label: string;
  height: number;
  descriptorUrl: string;
};

export type SabrRequestMessage = {
  type: "init" | "segment" | "pump";
  requestId: string;
  itag: number;
  sequence?: number;
  playerTimeMs: number;
  videoActive: boolean;
  audioActive: boolean;
};

export type SabrSegmentMessage = {
  type: "segment";
  requestId?: string;
  itag: number;
  sequence: number;
  init: boolean;
  startMs: number;
  durationMs: number;
  length: number;
};

export type SabrMediaChunk = {
  metadata: SabrSegmentMessage;
  bytes: Uint8Array<ArrayBuffer>;
};
