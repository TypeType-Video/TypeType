import type { AccessMode } from "./user";

export type AdminSettings = {
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  minAndroidClientVersion: string | null;
  allowRegistration: boolean;
  allowGuest: boolean;
  forceEmailVerification: boolean;
  activeSessionsEnabled: boolean;
  localLoginEnabled: boolean;
  oidcAutoRedirect: boolean;
  youtubeRemoteLoginEnabled: boolean;
  accessMode: AccessMode;
};

type AdminSessionNowPlaying = {
  videoUrl: string;
  title: string;
  thumbnail?: string | null;
  channelName?: string | null;
  positionMs: number;
  durationMs?: number | null;
  paused: boolean;
  updatedAt: number;
};

export type AdminSession = {
  id: string;
  userId?: string | null;
  username?: string | null;
  clientName?: string | null;
  clientVersion?: string | null;
  deviceId?: string | null;
  deviceName?: string | null;
  deviceType?: string | null;
  userAgent?: string | null;
  remoteAddress?: string | null;
  lastActivityAt: number;
  lastPlaybackAt?: number | null;
  nowPlaying?: AdminSessionNowPlaying | null;
};
