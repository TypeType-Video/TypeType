import type { VideoItem } from "./api";

export type { PlaylistItem } from "./user";

export type WatchPlaylistItem = {
  key: string;
  url: string;
  title: string;
  thumbnail: string;
  channelName?: string;
};

export type PublicPlaylistInfo = {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  uploaderName: string;
  streamCount: number;
  playlistType: string;
};

export type PublicPlaylistResponse = {
  playlist: PublicPlaylistInfo;
  videos: VideoItem[];
  nextpage: string | null;
};

export type ChannelPlaylistsResponse = {
  playlists: PublicPlaylistInfo[];
  nextpage: string | null;
};
