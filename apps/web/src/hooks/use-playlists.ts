import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../lib/api";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  fetchPlaylist,
  fetchPlaylists,
  removeVideoFromPlaylist,
  reorderPlaylist,
  updatePlaylist,
} from "../lib/api-playlists";
import type { PlaylistItem, PlaylistVideoItem } from "../types/user";
import { useAuth } from "./use-auth";

const KEY = ["playlists"];

type RenamePayload = { id: string; name: string; description?: string };

type AddVideoPayload = {
  playlistId: string;
  video: Pick<
    PlaylistVideoItem,
    | "url"
    | "title"
    | "thumbnail"
    | "channelName"
    | "channelUrl"
    | "channelAvatar"
    | "viewCount"
    | "duration"
  >;
};

type RemoveVideoPayload = {
  playlistId: string;
  videoUrl: string;
};

function reorderByUrl(videos: PlaylistVideoItem[], order: string[]): PlaylistVideoItem[] {
  const byUrl = new Map(videos.map((video) => [video.url, video]));
  return order
    .map((url) => byUrl.get(url))
    .filter((video): video is PlaylistVideoItem => video !== undefined)
    .map((video, index) => ({ ...video, position: index }));
}

export function usePlaylists() {
  const qc = useQueryClient();
  const { authReady, isAuthed } = useAuth();

  const query = useQuery({
    queryKey: KEY,
    queryFn: fetchPlaylists,
    enabled: authReady && isAuthed,
  });

  const create = useMutation({
    mutationFn: (name: string) =>
      isAuthed
        ? createPlaylist(name)
        : Promise.reject(new ApiError("Authentication required", 401)),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => (isAuthed ? deletePlaylist(id) : Promise.resolve()),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const rename = useMutation({
    mutationFn: ({ id, name, description }: RenamePayload) =>
      isAuthed ? updatePlaylist(id, { name, description }) : Promise.resolve(),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const addVideo = useMutation({
    mutationFn: ({ playlistId, video }: AddVideoPayload) =>
      isAuthed
        ? addVideoToPlaylist(playlistId, video)
        : Promise.reject(new ApiError("Authentication required", 401)),
    onMutate: async ({ playlistId, video }) => {
      await qc.cancelQueries({ queryKey: KEY });
      const snapshot = qc.getQueryData<PlaylistItem[]>(KEY);
      qc.setQueryData<PlaylistItem[]>(KEY, (old) =>
        (old ?? []).map((p) =>
          p.id === playlistId
            ? {
                ...p,
                videos: [
                  ...p.videos,
                  {
                    id: "",
                    position: p.videos.length,
                    channelName: "",
                    channelUrl: "",
                    channelAvatar: "",
                    viewCount: 0,
                    watchPosition: 0,
                    watched: false,
                    progressUpdatedAt: 0,
                    ...video,
                  },
                ],
              }
            : p,
        ),
      );
      return { snapshot };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.snapshot !== undefined) qc.setQueryData(KEY, ctx.snapshot);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const removeVideo = useMutation({
    mutationFn: ({ playlistId, videoUrl }: RemoveVideoPayload) =>
      isAuthed ? removeVideoFromPlaylist(playlistId, videoUrl) : Promise.resolve(),
    onMutate: async ({ playlistId, videoUrl }) => {
      await qc.cancelQueries({ queryKey: KEY });
      const snapshot = qc.getQueryData<PlaylistItem[]>(KEY);
      qc.setQueryData<PlaylistItem[]>(KEY, (old) =>
        (old ?? []).map((p) =>
          p.id === playlistId ? { ...p, videos: p.videos.filter((v) => v.url !== videoUrl) } : p,
        ),
      );
      return { snapshot };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.snapshot !== undefined) qc.setQueryData(KEY, ctx.snapshot);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const reorder = useMutation({
    mutationFn: ({ id, order }: { id: string; order: string[] }) =>
      isAuthed ? reorderPlaylist(id, order) : Promise.resolve(),
    onMutate: async ({ id, order }) => {
      const detailKey = [...KEY, id];
      await qc.cancelQueries({ queryKey: detailKey });
      const snapshot = qc.getQueryData<PlaylistItem>(detailKey);
      qc.setQueryData<PlaylistItem>(detailKey, (old) =>
        old ? { ...old, videos: reorderByUrl(old.videos, order) } : old,
      );
      return { snapshot, detailKey };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(ctx.detailKey, ctx.snapshot);
    },
    onSuccess: (_d, { id }) => qc.invalidateQueries({ queryKey: [...KEY, id] }),
  });

  function isInPlaylist(playlistId: string, videoUrl: string): boolean {
    if (!isAuthed) return false;
    const pl = (query.data ?? []).find((p) => p.id === playlistId);
    return pl?.videos.some((v) => v.url === videoUrl) ?? false;
  }

  return { query, create, remove, rename, addVideo, removeVideo, reorder, isInPlaylist };
}

export function usePlaylist(id: string) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => fetchPlaylist(id),
    enabled: id.length > 0,
  });
}
