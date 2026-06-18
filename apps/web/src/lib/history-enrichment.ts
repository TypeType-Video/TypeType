import type { StreamResponse } from "../types/api";
import type { HistoryItem } from "../types/user";
import { fetchStream } from "./api-stream";

const CACHE_MS = 30 * 60 * 1000;

type CacheEntry = {
  updatedAt: number;
  avatarUrl: string;
  uploaderVerified: boolean;
};

type HistoryChannelMeta = {
  avatarUrl: string | null;
  uploaderVerified: boolean;
};

const avatarCache = new Map<string, CacheEntry>();
const pendingByChannel = new Map<string, Promise<HistoryChannelMeta>>();

function fromStream(stream: StreamResponse): HistoryChannelMeta {
  return {
    avatarUrl:
      stream.uploaderAvatarUrl && stream.uploaderAvatarUrl.length > 0
        ? stream.uploaderAvatarUrl
        : null,
    uploaderVerified: stream.uploaderVerified,
  };
}

function cached(channelUrl: string): HistoryChannelMeta | null {
  const hit = avatarCache.get(channelUrl);
  if (!hit) return null;
  if (Date.now() - hit.updatedAt > CACHE_MS) {
    avatarCache.delete(channelUrl);
    return null;
  }
  return { avatarUrl: hit.avatarUrl || null, uploaderVerified: hit.uploaderVerified };
}

function setCache(channelUrl: string, meta: HistoryChannelMeta): void {
  avatarCache.set(channelUrl, {
    avatarUrl: meta.avatarUrl ?? "",
    uploaderVerified: meta.uploaderVerified,
    updatedAt: Date.now(),
  });
}

export async function resolveHistoryChannelMeta(item: HistoryItem): Promise<HistoryChannelMeta> {
  const current = {
    avatarUrl: item.channelAvatar ?? null,
    uploaderVerified: item.uploaderVerified ?? false,
  };
  if (item.channelAvatar && item.uploaderVerified !== undefined) return current;
  const channelUrl = item.channelUrl;
  if (!channelUrl) return current;
  const hit = cached(channelUrl);
  if (hit)
    return {
      avatarUrl: current.avatarUrl ?? hit.avatarUrl,
      uploaderVerified: hit.uploaderVerified,
    };
  const pending = pendingByChannel.get(channelUrl);
  if (pending)
    return pending.then((meta) => ({ ...meta, avatarUrl: current.avatarUrl ?? meta.avatarUrl }));
  const task = (async () => {
    try {
      const stream = await fetchStream(item.url);
      const meta = fromStream(stream);
      setCache(channelUrl, meta);
      return meta;
    } catch {
      return current;
    } finally {
      pendingByChannel.delete(channelUrl);
    }
  })();
  pendingByChannel.set(channelUrl, task);
  return task;
}

export async function resolveHistoryAvatar(item: HistoryItem): Promise<string | null> {
  return resolveHistoryChannelMeta(item).then((meta) => meta.avatarUrl);
}
