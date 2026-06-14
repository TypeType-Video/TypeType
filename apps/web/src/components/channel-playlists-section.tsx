import { useChannelPlaylists } from "../hooks/use-channel-playlists";
import { PageSpinner } from "./page-spinner";
import { PublicPlaylistCard } from "./public-playlist-card";
import { ScrollSentinel } from "./scroll-sentinel";

type Props = {
  channelUrl: string;
};

export function ChannelPlaylistsSection({ channelUrl }: Props) {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useChannelPlaylists(channelUrl);
  const playlists = (data?.pages.flatMap((p) => p.playlists) ?? []).filter(
    (pl, i, arr) => arr.findIndex((x) => x.url === pl.url) === i,
  );

  if (isLoading) return <PageSpinner />;
  if (playlists.length === 0) {
    return <p className="text-fg-muted text-sm">No playlists on this channel.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {playlists.map((pl) => (
          <PublicPlaylistCard key={pl.url} playlist={pl} />
        ))}
      </div>
      <ScrollSentinel onIntersect={fetchNextPage} enabled={hasNextPage && !isFetchingNextPage} />
    </div>
  );
}
