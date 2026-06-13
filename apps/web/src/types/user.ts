export type ServiceId = 0 | 5 | 6;
export type SponsorBlockMode = "auto_skip" | "mark_only" | "disabled";
export type SponsorBlockCategoryAction = "auto_skip" | "mark_only" | "disabled";
type SponsorBlockCategoryActions = Record<string, SponsorBlockCategoryAction>;

export type HistoryItem = {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelUrl: string;
  channelAvatar?: string;
  uploaderVerified?: boolean;
  duration: number;
  progress: number;
  watchedAt: number;
};

export type SubscriptionItem = {
  channelUrl: string;
  name: string;
  avatarUrl: string;
  subscribedAt: number;
};

export type PlaylistVideoItem = {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  duration: number;
  position: number;
  watchPosition: number;
  watched: boolean;
  progressUpdatedAt: number;
};

export type PlaylistItem = {
  id: string;
  name: string;
  description: string;
  videos: PlaylistVideoItem[];
  createdAt: number;
};

export type FavoriteItem = {
  videoUrl: string;
  favoritedAt: number;
};

export type WatchLaterItem = {
  url: string;
  title: string;
  thumbnail: string;
  duration: number;
  addedAt: number;
};

export type ProgressItem = {
  videoUrl: string;
  position: number;
  updatedAt: number;
};

export type SettingsItem = {
  defaultService: ServiceId;
  defaultQuality: string;
  autoplay: boolean;
  volume: number;
  muted: boolean;
  subtitlesEnabled: boolean;
  defaultSubtitleLanguage: string;
  defaultAudioLanguage: string;
  preferOriginalLanguage: boolean;
  enableHighQualityPlayback: boolean;
  sponsorBlockMode: SponsorBlockMode;
  sponsorBlockCategoryActions: SponsorBlockCategoryActions;
  sponsorBlockMinimumDuration: number;
  sponsorBlockShowCurrentSegment: boolean;
  sponsorBlockShowChapters: boolean;
  sponsorBlockShowFullVideoLabels: boolean;
  sponsorBlockManualSkipOnFullVideo: boolean;
  sponsorBlockSkipNonMusicOnlyOnMusicVideos: boolean;
  sponsorBlockMuteInsteadOfSkip: boolean;
  hideHomeRecommendations: boolean;
  hideRelatedVideos: boolean;
  hideComments: boolean;
  hideShorts: boolean;
};

export type SearchHistoryItem = {
  id: string;
  term: string;
  searchedAt: number;
};

export type BlockedItem = {
  url: string;
  name?: string;
  thumbnailUrl?: string;
  blockedAt: number;
  global?: boolean;
};
