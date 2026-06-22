import {
  useAdminAllowListMutations,
  useAdminUserAllowList,
} from "../hooks/use-admin-granular-allow-list";
import type { AdminAllowListUser } from "../types/allow-list";
import { AdminAllowListChannelList } from "./admin-allow-list-channel-list";
import { AdminAllowListForm } from "./admin-allow-list-form";
import { AdminAllowListPlaylistList } from "./admin-allow-list-playlist-list";
import { AdminAllowListPlaylistSearch } from "./admin-allow-list-playlist-search";
import { AdminUserAvatar } from "./admin-user-avatar";

type Props = {
  user: AdminAllowListUser;
  onToast: (message: string) => void;
};

export function AdminAllowListUserDetail({ user, onToast }: Props) {
  const detail = useAdminUserAllowList(user.id);
  const mutations = useAdminAllowListMutations(user.id);
  const data = detail.data;
  const selected = data?.user ?? user;
  const restricted = selected.accessMode === "allow_list";

  function toggleMode() {
    const accessMode = restricted ? "unrestricted" : "allow_list";
    mutations.userMode.mutate(
      { id: selected.id, accessMode },
      {
        onSuccess: () =>
          onToast(accessMode === "allow_list" ? "User restricted" : "User unrestricted"),
        onError: (error) =>
          onToast(error instanceof Error ? error.message : "Unable to update user"),
      },
    );
  }

  if (detail.isLoading || !data) {
    return (
      <section className="border-t border-border pt-4 text-sm text-fg-soft">
        Loading user allow list...
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="border-t border-border pt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <AdminUserAvatar
              user={{
                ...selected,
                role: "user",
                publicUsername: null,
                bio: null,
                avatarUrl: null,
                avatarType: null,
                avatarCode: null,
                suspended: false,
                verified: false,
                createdAt: 0,
              }}
              className="h-10 w-10"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-fg">
                {selected.name || selected.email}
              </p>
              <p className="truncate text-xs text-fg-soft">{selected.email}</p>
            </div>
          </div>
          <button
            type="button"
            disabled={mutations.userMode.isPending}
            onClick={toggleMode}
            className={`h-8 border px-3 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              restricted ? "border-fg bg-fg text-app" : "border-border text-fg-soft hover:text-fg"
            }`}
          >
            {restricted ? "Allow-list" : "Unrestricted"}
          </button>
        </div>
      </section>

      <AdminAllowListChannelList title="Inherited global channels" channels={data.globalChannels} />
      <AdminAllowListPlaylistList
        title="Inherited global playlists"
        playlists={data.globalPlaylists}
      />

      <AdminAllowListForm
        title="Add channel for this user"
        description="Search by channel name or handle. This does not affect other users."
        trustedUrls={[...data.globalChannels, ...data.userChannels].map((item) => item.url)}
        pending={mutations.addUserChannel.isPending}
        onAdd={(channel) => mutations.addUserChannel.mutate({ id: selected.id, channel })}
      />
      <AdminAllowListChannelList
        title="User channels"
        channels={data.userChannels}
        onRemove={(url) => mutations.removeUserChannel.mutate({ id: selected.id, url })}
      />

      <AdminAllowListPlaylistSearch
        title="Add playlist for this user"
        description="Search playlists by name. This does not affect other users."
        addedUrls={[...data.globalPlaylists, ...data.userPlaylists].map((item) => item.url)}
        pending={mutations.addUserPlaylist.isPending}
        onAdd={(playlist) => mutations.addUserPlaylist.mutate({ id: selected.id, playlist })}
      />
      <AdminAllowListPlaylistList
        title="User playlists"
        playlists={data.userPlaylists}
        onRemove={(url) => mutations.removeUserPlaylist.mutate({ id: selected.id, url })}
      />
    </div>
  );
}
