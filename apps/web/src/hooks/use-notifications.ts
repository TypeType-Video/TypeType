import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  fetchUnreadNotificationsCount,
  markAllNotificationsRead,
} from "../lib/api-notifications";
import { useAuth } from "./use-auth";

const KEY = ["notifications"];
const UNREAD_KEY = ["notifications-unread-count"];
const PAGE_SIZE = 20;

export function useNotifications(open: boolean) {
  const qc = useQueryClient();
  const { authReady, isAuthed, isGuest } = useAuth();
  const enabled = authReady && isAuthed && !isGuest;

  const unreadQuery = useQuery({
    queryKey: UNREAD_KEY,
    queryFn: () => fetchUnreadNotificationsCount(),
    enabled,
    refetchInterval: enabled ? 90_000 : false,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const query = useInfiniteQuery({
    queryKey: KEY,
    queryFn: ({ pageParam = 0 }) => fetchNotifications(pageParam, PAGE_SIZE),
    getNextPageParam: (lastPage) => lastPage.nextpage ?? undefined,
    initialPageParam: 0,
    enabled: enabled && open,
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const markAllRead = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: UNREAD_KEY });
    },
  });

  return {
    query,
    unreadQuery,
    markAllRead,
    unreadCount: unreadQuery.data?.unreadCount ?? 0,
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
    enabled,
  };
}
