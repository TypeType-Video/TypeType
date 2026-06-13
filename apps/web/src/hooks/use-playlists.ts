import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../lib/api";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  fetchPlaylist,
  fetchPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../lib/api-playlists";
import type { PlaylistItem, PlaylistVideoItem } from "../types/user";
import { useAuth } from "./use-auth";

const KEY = ["playlists"];

type RenamePayload = { id: string; name: string; description?: string };

type AddVideoPayload = {
  playlistId: string;
  video: Omit<PlaylistVideoItem, "id" | "position">;
};

type RemoveVideoPayload = {
  playlistId: string;
  videoUrl: string;
};

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
            ? { ...p, videos: [...p.videos, { id: "", position: p.videos.length, ...video }] }
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

  function isInPlaylist(playlistId: string, videoUrl: string): boolean {
    if (!isAuthed) return false;
    const pl = (query.data ?? []).find((p) => p.id === playlistId);
    return pl?.videos.some((v) => v.url === videoUrl) ?? false;
  }

  return { query, create, remove, rename, addVideo, removeVideo, isInPlaylist };
}

export function usePlaylist(id: string) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => fetchPlaylist(id),
  });
}
