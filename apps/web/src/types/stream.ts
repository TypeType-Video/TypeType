import type {
  AudioStreamItem,
  PreviewFrameItem,
  SponsorBlockSegmentItem,
  StreamSegmentItem,
  SubtitleItem,
  VideoStreamItem,
} from "./api";

export type VideoStream = {
  id: string;
  title: string;
  thumbnail: string;
  rawThumbnail: string;
  rawChannelAvatar: string;
  description?: string;
  channelName: string;
  channelUrl?: string;
  channelAvatar: string;
  uploaderVerified?: boolean;
  uploaderSubscriberCount?: number;
  views: number;
  duration: number;
  publishedAt?: number;
  likes?: number;
  dislikes?: number;
  streamType?: string;
  isLive?: boolean;
  isPostLive?: boolean;
  isLiveContent?: boolean;
  hasLiveManifest?: boolean;
  isShortFormContent?: boolean;
  requiresMembership?: boolean;
  startPosition?: number;
  streamSegments?: StreamSegmentItem[];
  hlsUrl?: string;
  tags?: string[];
  category?: string;
  shortDescription?: string;
  related?: VideoStream[];
  videoStreams?: VideoStreamItem[];
  videoOnlyStreams?: VideoStreamItem[];
  audioStreams?: AudioStreamItem[];
  originalAudioTrackId?: string | null;
  preferredDefaultAudioTrackId?: string | null;
  subtitles?: SubtitleItem[];
  previewFrames?: PreviewFrameItem[];
  sponsorBlockSegments?: SponsorBlockSegmentItem[];
};
