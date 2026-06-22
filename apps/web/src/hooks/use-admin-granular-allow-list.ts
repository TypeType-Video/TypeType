import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addAdminAllowedPlaylist,
  addAdminUserAllowedChannel,
  addAdminUserAllowedPlaylist,
  fetchAdminAllowedPlaylists,
  fetchAdminUserAllowList,
  removeAdminAllowedPlaylist,
  removeAdminUserAllowedChannel,
  removeAdminUserAllowedPlaylist,
  searchAdminUsers,
  updateAdminUserAccessMode,
} from "../lib/api-admin-allow-list";
import type { AllowPlaylistInput } from "../types/allow-list";
import type { ChannelResultItem } from "../types/api";
import type { AccessMode } from "../types/user";

const ADMIN_ALLOWED_PLAYLISTS_KEY = ["admin-allowed-playlists"];
const adminUserAllowListKey = (id: string) => ["admin-user-allow-list", id];

export function useAdminAllowedPlaylists(enabled: boolean) {
  return useQuery({
    queryKey: ADMIN_ALLOWED_PLAYLISTS_KEY,
    queryFn: fetchAdminAllowedPlaylists,
    enabled,
  });
}

export function useAdminUserSearch(query: string, enabled: boolean) {
  const q = query.trim();
  return useQuery({
    queryKey: ["admin-users-search", q],
    queryFn: () => searchAdminUsers(q, 20),
    enabled: enabled && q.length >= 2,
    staleTime: 30 * 1000,
  });
}

export function useAdminUserAllowList(userId: string | null) {
  return useQuery({
    queryKey: userId ? adminUserAllowListKey(userId) : ["admin-user-allow-list", "none"],
    queryFn: () => fetchAdminUserAllowList(userId ?? ""),
    enabled: Boolean(userId),
  });
}

export function useAdminAllowListMutations(selectedUserId: string | null) {
  const qc = useQueryClient();
  const refreshUser = () => {
    if (selectedUserId) qc.invalidateQueries({ queryKey: adminUserAllowListKey(selectedUserId) });
  };
  const refreshGlobalPlaylists = () =>
    qc.invalidateQueries({ queryKey: ADMIN_ALLOWED_PLAYLISTS_KEY });
  const userMode = useMutation({
    mutationFn: ({ id, accessMode }: { id: string; accessMode: AccessMode }) =>
      updateAdminUserAccessMode(id, accessMode),
    onSuccess: refreshUser,
  });
  const addUserChannel = useMutation({
    mutationFn: ({ id, channel }: { id: string; channel: ChannelResultItem }) =>
      addAdminUserAllowedChannel(id, channel.url, channel.name, channel.thumbnailUrl),
    onSuccess: refreshUser,
  });
  const removeUserChannel = useMutation({
    mutationFn: ({ id, url }: { id: string; url: string }) =>
      removeAdminUserAllowedChannel(id, url),
    onSuccess: refreshUser,
  });
  const addGlobalPlaylist = useMutation({
    mutationFn: addAdminAllowedPlaylist,
    onSuccess: refreshGlobalPlaylists,
  });
  const removeGlobalPlaylist = useMutation({
    mutationFn: removeAdminAllowedPlaylist,
    onSuccess: refreshGlobalPlaylists,
  });
  const addUserPlaylist = useMutation({
    mutationFn: ({ id, playlist }: { id: string; playlist: AllowPlaylistInput }) =>
      addAdminUserAllowedPlaylist(id, playlist),
    onSuccess: refreshUser,
  });
  const removeUserPlaylist = useMutation({
    mutationFn: ({ id, url }: { id: string; url: string }) =>
      removeAdminUserAllowedPlaylist(id, url),
    onSuccess: refreshUser,
  });
  return {
    userMode,
    addUserChannel,
    removeUserChannel,
    addGlobalPlaylist,
    removeGlobalPlaylist,
    addUserPlaylist,
    removeUserPlaylist,
  };
}
