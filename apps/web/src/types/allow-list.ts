import type { AccessMode, AllowedChannelItem } from "./user";

export type AdminAllowListUser = {
  id: string;
  email: string;
  name: string;
  accessMode: AccessMode;
  adminManagedAccessMode?: boolean;
  avatarUrl?: string | null;
  avatarType?: "custom" | "emoji" | null;
  avatarCode?: string | null;
};

export type AdminManagedAccessUsersPage = {
  items: AdminAllowListUser[];
  nextpage: string | null;
};

export type AllowedPlaylistItem = {
  url: string;
  title: string | null;
  thumbnailUrl: string | null;
  uploaderName: string | null;
  allowedAt: number;
  global: boolean | null;
};

export type AdminUserAllowList = {
  user: AdminAllowListUser;
  globalChannels: AllowedChannelItem[];
  userChannels: AllowedChannelItem[];
  globalPlaylists: AllowedPlaylistItem[];
  userPlaylists: AllowedPlaylistItem[];
};

export type AllowPlaylistInput = {
  url: string;
  title?: string | null;
  thumbnailUrl?: string | null;
  uploaderName?: string | null;
};
