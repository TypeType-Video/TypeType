export type ServiceId = 0 | 5 | 6;

export type HistoryItem = {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelUrl: string;
  channelAvatar?: string;
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
};

export type PlaylistItem = {
  id: string;
  name: string;
  description: string;
  videos: PlaylistVideoItem[];
  createdAt: number;
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
