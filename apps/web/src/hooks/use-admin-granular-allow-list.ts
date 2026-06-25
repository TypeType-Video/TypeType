import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addAdminAllowedPlaylist,
  addAdminUserAllowedChannel,
  addAdminUserAllowedPlaylist,
  fetchAdminAllowedPlaylists,
  fetchAdminManagedAccessUsers,
  fetchAdminUserAllowList,
  removeAdminAllowedPlaylist,
  removeAdminUserAllowedChannel,
  removeAdminUserAllowedPlaylist,
  searchAdminUsers,
  updateAdminUserAccessMode,
} from "../lib/api-admin-allow-list";
import type { AdminUserAllowList, AllowPlaylistInput } from "../types/allow-list";
import type { ChannelResultItem } from "../types/api";
import type { AccessMode } from "../types/user";

const ADMIN_ALLOWED_PLAYLISTS_KEY = ["admin-allowed-playlists"];
const ADMIN_MANAGED_ACCESS_USERS_KEY = ["admin-managed-access-users"];
const ADMIN_USERS_SEARCH_KEY = ["admin-users-search"];
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
    queryKey: [...ADMIN_USERS_SEARCH_KEY, q],
    queryFn: () => searchAdminUsers(q, 20),
    enabled: enabled && q.length >= 2,
    staleTime: 30 * 1000,
  });
}

export function useAdminAllowListUsers(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ADMIN_MANAGED_ACCESS_USERS_KEY,
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      fetchAdminManagedAccessUsers(100, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextpage ?? undefined,
    enabled,
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
  const setUserMode = (id: string, accessMode: AccessMode) => {
    qc.setQueryData<AdminUserAllowList>(adminUserAllowListKey(id), (current) =>
      current
        ? {
            ...current,
            user: { ...current.user, accessMode, adminManagedAccessMode: true },
          }
        : current,
    );
  };
  const refreshManagedUsers = () => {
    qc.invalidateQueries({ queryKey: ADMIN_MANAGED_ACCESS_USERS_KEY });
    qc.invalidateQueries({ queryKey: ADMIN_USERS_SEARCH_KEY });
  };
  const refreshGlobalPlaylists = () =>
    qc.invalidateQueries({ queryKey: ADMIN_ALLOWED_PLAYLISTS_KEY });
  const userMode = useMutation({
    mutationFn: ({ id, accessMode }: { id: string; accessMode: AccessMode }) =>
      updateAdminUserAccessMode(id, accessMode),
    onSuccess: (accessMode, { id }) => {
      setUserMode(id, accessMode);
      refreshManagedUsers();
    },
  });
  const addUserChannel = useMutation({
    mutationFn: ({ id, channel }: { id: string; channel: ChannelResultItem }) =>
      addAdminUserAllowedChannel(id, channel.url, channel.name, channel.thumbnailUrl),
    onSuccess: () => {
      refreshUser();
      refreshManagedUsers();
    },
  });
  const removeUserChannel = useMutation({
    mutationFn: ({ id, url }: { id: string; url: string }) =>
      removeAdminUserAllowedChannel(id, url),
    onSuccess: () => {
      refreshUser();
      refreshManagedUsers();
    },
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
    onSuccess: () => {
      refreshUser();
      refreshManagedUsers();
    },
  });
  const removeUserPlaylist = useMutation({
    mutationFn: ({ id, url }: { id: string; url: string }) =>
      removeAdminUserAllowedPlaylist(id, url),
    onSuccess: () => {
      refreshUser();
      refreshManagedUsers();
    },
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
