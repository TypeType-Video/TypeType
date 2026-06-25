import {
  useAdminAllowedPlaylists,
  useAdminAllowListMutations,
} from "../hooks/use-admin-granular-allow-list";
import { useAdminSettings } from "../hooks/use-admin-settings";
import { useAllowedChannels } from "../hooks/use-allowed-channels";
import { AdminAllowListChannelList } from "./admin-allow-list-channel-list";
import { AdminAllowListForm } from "./admin-allow-list-form";
import { AdminAllowListPlaylistList } from "./admin-allow-list-playlist-list";
import { AdminAllowListPlaylistSearch } from "./admin-allow-list-playlist-search";
import { AdminAllowListUsers } from "./admin-allow-list-users";

const MODE_BUTTON =
  "h-8 border border-border px-3 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60";

type Props = {
  enabled: boolean;
  onToast: (message: string) => void;
};

export function AdminAllowListSection({ enabled, onToast }: Props) {
  const adminSettings = useAdminSettings(enabled);
  const { query, add, remove } = useAllowedChannels();
  const globalPlaylists = useAdminAllowedPlaylists(enabled);
  const mutations = useAdminAllowListMutations(null);
  const settings = adminSettings.query.data;
  const channels = (query.data ?? []).filter((item) => item.global === true);
  const playlists = globalPlaylists.data ?? [];
  const instanceRestricted = settings?.accessMode === "allow_list";

  function setMode(accessMode: "unrestricted" | "allow_list") {
    if (!settings) return;
    adminSettings.update.mutate(
      { ...settings, accessMode },
      {
        onSuccess: () => onToast("Allow list mode updated"),
        onError: (error) =>
          onToast(error instanceof Error ? error.message : "Unable to update mode"),
      },
    );
  }

  if (adminSettings.query.isPending) {
    return (
      <section className="border-t border-border pt-4 text-sm text-fg-muted">
        Loading allow list...
      </section>
    );
  }

  if (!settings || adminSettings.query.isError) {
    return (
      <section className="border-t border-danger pt-4 text-sm text-danger-strong">
        Unable to load allow list settings.
      </section>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <section className="border-t border-border pt-4">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-fg">Entire instance</h2>
            <p className="text-xs text-fg-soft">
              Restrict everyone to the admin allow list, including guests.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={adminSettings.update.isPending}
              onClick={() => setMode("unrestricted")}
              className={`${MODE_BUTTON} ${!instanceRestricted ? "bg-fg text-app" : "text-fg-soft hover:text-fg"}`}
            >
              Unrestricted
            </button>
            <button
              type="button"
              disabled={adminSettings.update.isPending}
              onClick={() => setMode("allow_list")}
              className={`${MODE_BUTTON} ${instanceRestricted ? "bg-fg text-app" : "text-fg-soft hover:text-fg"}`}
            >
              Restrict entire instance
            </button>
          </div>
        </div>
      </section>
      <AdminAllowListUsers
        enabled={enabled}
        instanceRestricted={instanceRestricted}
        onToast={onToast}
      />
      <AdminAllowListForm
        title="Add global channel"
        description="Search by channel name or handle. Added channels apply to every restricted user."
        trustedUrls={channels.map((item) => item.url)}
        pending={add.isPending}
        onAdd={(channel) =>
          add.mutate({
            url: channel.url,
            name: channel.name,
            thumbnailUrl: channel.thumbnailUrl,
            global: true,
          })
        }
      />
      <AdminAllowListChannelList channels={channels} onRemove={remove.mutate} />
      <AdminAllowListPlaylistSearch
        title="Add global playlist"
        description="Search playlists by name. Added playlists apply to every restricted user."
        addedUrls={playlists.map((item) => item.url)}
        pending={mutations.addGlobalPlaylist.isPending}
        onAdd={(playlist) => mutations.addGlobalPlaylist.mutate(playlist)}
      />
      <AdminAllowListPlaylistList
        title="Allowed playlists"
        playlists={playlists}
        onRemove={mutations.removeGlobalPlaylist.mutate}
      />
    </div>
  );
}
