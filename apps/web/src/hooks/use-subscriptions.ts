import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSubscriptions, subscribe, unsubscribe } from "../lib/api-user";
import { normalizeChannelUrl } from "../lib/channel-url";
import type { SubscriptionItem } from "../types/user";
import { useAuth } from "./use-auth";

export const SUBSCRIPTIONS_KEY = ["subscriptions"];

function hasSubscription(data: SubscriptionItem[] | undefined, channelUrl: string): boolean {
  const target = normalizeChannelUrl(channelUrl);
  return (data ?? []).some((item) => normalizeChannelUrl(item.channelUrl) === target);
}

function dedupeSubscriptions(data: SubscriptionItem[]): SubscriptionItem[] {
  const kept = new Set<string>();
  const output: SubscriptionItem[] = [];
  for (const item of data) {
    const normalized = normalizeChannelUrl(item.channelUrl);
    if (kept.has(normalized)) continue;
    kept.add(normalized);
    output.push(item);
  }
  return output;
}

export function useSubscriptions() {
  const qc = useQueryClient();
  const { authReady, isAuthed } = useAuth();

  const query = useQuery({
    queryKey: SUBSCRIPTIONS_KEY,
    queryFn: fetchSubscriptions,
    enabled: authReady && isAuthed,
    select: dedupeSubscriptions,
    staleTime: 5 * 60 * 1000,
  });

  const add = useMutation({
    mutationFn: (item: Omit<SubscriptionItem, "subscribedAt">) => {
      if (!isAuthed) return Promise.resolve();
      if (hasSubscription(query.data, item.channelUrl)) return Promise.resolve();
      return subscribe({
        ...item,
        channelUrl: normalizeChannelUrl(item.channelUrl),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY }),
  });

  const remove = useMutation({
    mutationFn: (channelUrl: string) => (isAuthed ? unsubscribe(channelUrl) : Promise.resolve()),
    onSuccess: () => qc.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY }),
  });

  function isSubscribed(channelUrl: string): boolean {
    return hasSubscription(query.data, channelUrl);
  }

  return { query, add, remove, isSubscribed };
}
