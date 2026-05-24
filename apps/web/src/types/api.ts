import type {
  AudioStreamItem,
  PreviewFrameItem,
  SponsorBlockSegmentItem,
  StreamSegmentItem,
  SubtitleItem,
  VideoStreamItem,
} from "./stream-items";

export type {
  AudioStreamItem,
  PreviewFrameItem,
  SponsorBlockSegmentItem,
  StreamSegmentItem,
  SubtitleItem,
  VideoStreamItem,
};

export type VideoItem = {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  uploaderName: string;
  uploaderUrl: string;
  uploaderAvatarUrl: string;
  uploaderVerified: boolean;
  duration: number;
  viewCount: number;
  publishedAt?: number | null;
  uploadDate: string;
  uploaded: number;
  streamType: string;
  isShortFormContent: boolean;
  shortDescription: string | null;
};

export type StreamResponse = {
  id: string;
  title: string;
  uploaderName: string;
  uploaderUrl: string;
  uploaderAvatarUrl: string;
  thumbnailUrl: string;
  description: string;
  duration: number;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  publishedAt?: number | null;
  uploadDate: string;
  uploaded: number;
  uploaderSubscriberCount: number;
  uploaderVerified: boolean;
  category: string;
  license: string;
  visibility: string;
  tags: string[];
  streamType: string;
  isShortFormContent: boolean;
  requiresMembership: boolean;
  startPosition: number;
  streamSegments: StreamSegmentItem[];
  hlsUrl: string;
  dashMpdUrl: string;
  originalAudioTrackId: string | null;
  preferredDefaultAudioTrackId: string | null;
  videoStreams: VideoStreamItem[];
  audioStreams: AudioStreamItem[];
  videoOnlyStreams: VideoStreamItem[];
  sponsorBlockSegments: SponsorBlockSegmentItem[];
  subtitles: SubtitleItem[];
  previewFrames: PreviewFrameItem[];
  relatedStreams: VideoItem[];
};

export type SearchPageResponse = {
  items: VideoItem[];
  nextpage: string | null;
  searchSuggestion: string | null;
  isCorrectedSearch: boolean;
};

export type HomeRecommendationsResponse = {
  items: VideoItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type SubscriptionFeedPage = {
  videos: VideoItem[];
  nextpage: string | null;
};

export type CommentItem = {
  id: string;
  text: string;
  author: string;
  authorUrl: string;
  authorAvatarUrl: string;
  likeCount: number;
  textualLikeCount: string;
  publishedTime: string;
  publishedAt?: number | null;
  isHeartedByUploader: boolean;
  isPinned: boolean;
  uploaderVerified: boolean;
  replyCount: number;
  repliesPage: string | null;
};

export type CommentsPageResponse = {
  comments: CommentItem[];
  nextpage: string | null;
  commentsDisabled: boolean;
};

export type BulletCommentItem = {
  text: string;
  argbColor: number;
  position: "REGULAR" | "TOP" | "BOTTOM" | "SUPERCHAT";
  relativeFontSize: number;
  durationMs: number;
  isLive: boolean;
};

export type BulletCommentsPageResponse = {
  comments: BulletCommentItem[];
  nextpage: string | null;
};

export type ChannelResponse = {
  name: string;
  description: string;
  avatarUrl: string;
  bannerUrl: string;
  subscriberCount: number;
  isVerified: boolean;
  videos: VideoItem[];
  nextpage: string | null;
};

export type PodcastItem = {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  uploaderName: string;
  streamCount: number;
  playlistType: string;
};

export type PodcastPageResponse = {
  channelName: string;
  channelUrl: string;
  podcasts: PodcastItem[];
  episodes: VideoItem[];
  nextpage: string | null;
};

export type PodcastEpisodesResponse = {
  podcast: PodcastItem;
  episodes: VideoItem[];
  nextpage: string | null;
};
