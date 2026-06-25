import { useNavigate } from "@tanstack/react-router";
import { type ReactNode, useCallback, useEffect } from "react";
import { WatchPlaylistPanel } from "../components/watch-playlist-panel";
import { applyCustomOrder, randomShuffleSeed, shuffleByKey } from "../lib/playlist-shuffle";
import { isManagedPlaylistId } from "../lib/playlist-url";
import { toPublicWatchParam } from "../lib/watch-url";
import { usePlaylistOrderStore } from "../stores/playlist-order-store";
import type { WatchPlaylistItem } from "../types/playlist";
import { usePlaylist, usePlaylists } from "./use-playlists";
import { usePublicPlaylist } from "./use-public-playlist";

const MISSING_CURRENT_PREFETCH_LIMIT = 5;
const PREFETCH_REMAINING_ITEMS = 10;

type WatchPlaylist = {
  nextParam: string | null;
  nextVideo: WatchPlaylistItem | null;
  playPrevious?: () => void;
  playNext?: () => void;
  panel: ReactNode;
};

export function useWatchPlaylist(
  list: string | undefined,
  shuffle: string | undefined,
  currentParam: string,
): WatchPlaylist {
  const navigate = useNavigate();
  const managedList = list && isManagedPlaylistId(list) ? list : "";
  const publicListUrl =
    list && !isManagedPlaylistId(list) ? `https://www.youtube.com/playlist?list=${list}` : "";
  const managedPlaylist = usePlaylist(managedList);
  const publicPlaylist = usePublicPlaylist(publicListUrl);
  const { reorder } = usePlaylists();
  const setOrder = usePlaylistOrderStore((state) => state.setOrder);
  const customOrder = usePlaylistOrderStore((state) => (list ? state.orders[list] : undefined));
  const isManaged = managedList.length > 0;
  const name = isManaged
    ? (managedPlaylist.data?.name ?? "")
    : (publicPlaylist.data?.pages[0]?.playlist.title ?? "");
  const base: WatchPlaylistItem[] = isManaged
    ? (managedPlaylist.data?.videos ?? []).map((item) => ({
        key: item.id,
        url: item.url,
        title: item.title,
        thumbnail: item.thumbnail,
        channelName: item.channelName,
      }))
    : (publicPlaylist.data?.pages.flatMap((page) => page.streams) ?? []).map((item, index) => ({
        key: `${index}-${item.id}`,
        url: item.id,
        title: item.title,
        thumbnail: item.thumbnail,
        channelName: item.channelName,
      }));
  const arranged = !isManaged && customOrder ? applyCustomOrder(base, customOrder) : base;
  const videos = shuffle ? shuffleByKey(arranged, shuffle) : arranged;
  const inPlaylist = Boolean(list) && videos.length > 0;
  const currentIdx = inPlaylist
    ? videos.findIndex((video) => toPublicWatchParam(video.url) === currentParam)
    : -1;
  const loadedPublicPageCount = publicPlaylist.data?.pages.length ?? 0;
  const canLoadPublicPage =
    !isManaged && Boolean(publicPlaylist.hasNextPage) && !publicPlaylist.isFetchingNextPage;
  const loadMorePublic = useCallback(() => {
    if (canLoadPublicPage) void publicPlaylist.fetchNextPage();
  }, [canLoadPublicPage, publicPlaylist.fetchNextPage]);
  const previousVideo = currentIdx > 0 ? videos[currentIdx - 1] : undefined;
  const nextVideo = currentIdx >= 0 ? videos[currentIdx + 1] : undefined;
  const previousParam = previousVideo ? toPublicWatchParam(previousVideo.url) : null;
  const nextParam = nextVideo ? toPublicWatchParam(nextVideo.url) : null;
  const playPrevious = useCallback(() => {
    if (!previousParam) return;
    navigate({
      to: "/watch",
      search: { v: previousParam, list, ...(shuffle ? { shuffle } : {}) },
      resetScroll: false,
    });
  }, [previousParam, list, shuffle, navigate]);
  const playNext = useCallback(() => {
    if (!nextParam) return;
    navigate({
      to: "/watch",
      search: { v: nextParam, list, ...(shuffle ? { shuffle } : {}) },
      resetScroll: false,
    });
  }, [nextParam, list, shuffle, navigate]);

  useEffect(() => {
    if (!canLoadPublicPage || videos.length === 0) return;
    const missingCurrent = currentIdx < 0 && loadedPublicPageCount < MISSING_CURRENT_PREFETCH_LIMIT;
    const nearEnd = currentIdx >= 0 && currentIdx >= videos.length - PREFETCH_REMAINING_ITEMS;
    if (missingCurrent || nearEnd) void publicPlaylist.fetchNextPage();
  }, [
    canLoadPublicPage,
    currentIdx,
    loadedPublicPageCount,
    videos.length,
    publicPlaylist.fetchNextPage,
  ]);

  const panel =
    inPlaylist && list ? (
      <WatchPlaylistPanel
        name={name}
        videos={videos}
        listId={list}
        currentParam={currentParam}
        shuffle={shuffle}
        isLoadingMore={publicPlaylist.isFetchingNextPage}
        onLoadMore={canLoadPublicPage ? loadMorePublic : undefined}
        onToggleShuffle={() =>
          navigate({
            to: "/watch",
            search: { v: currentParam, list, ...(shuffle ? {} : { shuffle: randomShuffleSeed() }) },
            resetScroll: false,
          })
        }
        onReorder={(items) => {
          if (isManaged && list) reorder.mutate({ id: list, order: items.map((v) => v.url) });
          else if (list)
            setOrder(
              list,
              items.map((v) => v.key),
            );
          if (shuffle) {
            navigate({ to: "/watch", search: { v: currentParam, list }, resetScroll: false });
          }
        }}
      />
    ) : null;

  return {
    nextParam,
    nextVideo: nextVideo ?? null,
    playPrevious: previousParam ? playPrevious : undefined,
    playNext: nextParam ? playNext : undefined,
    panel,
  };
}
