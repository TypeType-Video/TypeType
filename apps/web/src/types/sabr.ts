export type SabrFormatDescriptor = {
  itag: number;
  mimeType: string;
  bitrate: number;
  approxDurationMs: number;
  qualityLabel: string | null;
  audioTrackId: string | null;
  audioTrackName: string | null;
  init: string;
};

export type SabrSessionDescriptor = {
  videoId: string;
  session: string;
  transport: "stateful-websocket";
  protocol: "typetype-sabr-ws-v1";
  startTimeMs: number;
  maxBinaryFrameBytes: number;
  durationMs: number;
  audio: SabrFormatDescriptor;
  video: SabrFormatDescriptor;
  endpoints: {
    webSocket: string;
    audioInit: string;
    videoInit: string;
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

export type SabrMseControllerArgs = {
  media: HTMLVideoElement;
  config: SabrSourceConfig;
  startTime: number;
  autoplay: boolean;
  onError: () => void;
};

export type SabrQualityOption = {
  itag: number;
  label: string;
  height: number;
  descriptorUrl: string;
};

export type SabrRequestMessage = {
  type: "state" | "pump";
  requestId: string;
  videoItag: number;
  audioItag: number;
  playerTimeMs: number;
  playbackRate: number;
  videoActive: boolean;
  audioActive: boolean;
};

export type SabrSegmentMessage = {
  type: "segment";
  requestId?: string;
  itag: number;
  init: boolean;
  startMs: number;
  durationMs: number;
  length: number;
};

export type SabrMediaChunk = {
  metadata: SabrSegmentMessage;
  bytes: Uint8Array<ArrayBuffer>;
};
