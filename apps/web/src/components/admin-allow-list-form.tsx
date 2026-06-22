import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { fetchSearch } from "../lib/api-discovery";
import { normalizeChannelUrl } from "../lib/channel-url";
import { formatSubscribers } from "../lib/format";
import { proxyImage } from "../lib/proxy";
import type { ChannelResultItem } from "../types/api";
import { ChannelAvatar } from "./channel-avatar";
import { ChannelRouteLink } from "./channel-route-link";

function isTrusted(channel: ChannelResultItem, trustedUrls: Set<string>): boolean {
  return trustedUrls.has(normalizeChannelUrl(channel.url));
}

type Props = {
  title: string;
  description: string;
  trustedUrls: string[];
  pending: boolean;
  onAdd: (channel: ChannelResultItem) => void;
};

export function AdminAllowListForm({ title, description, trustedUrls, pending, onAdd }: Props) {
  const [term, setTerm] = useState("");
  const debounced = useDebouncedValue(term.trim(), 300);
  const trusted = new Set(trustedUrls.map(normalizeChannelUrl));
  const search = useQuery({
    queryKey: ["admin-allow-list-channel-search", debounced],
    queryFn: () => fetchSearch(debounced, 0),
    enabled: debounced.length >= 2,
    staleTime: 60 * 1000,
  });
  const channels = search.data?.channels ?? [];

  return (
    <section className="border-t border-border pt-4">
      <div className="mb-3 flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
        <p className="text-xs text-fg-soft">{description}</p>
      </div>
      <input
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Channel name or @handle"
        className="h-10 w-full border border-border bg-app px-3 text-sm text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-border-strong"
      />
      <div className="mt-3 border-y border-border">
        {debounced.length < 2 ? (
          <div className="px-4 py-5 text-sm text-fg-soft">
            Type at least two characters to search channels.
          </div>
        ) : search.isLoading ? (
          <div className="px-4 py-5 text-sm text-fg-soft">Searching channels...</div>
        ) : channels.length === 0 ? (
          <div className="px-4 py-5 text-sm text-fg-soft">
            No channels found. Try the exact channel name or handle.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {channels.slice(0, 8).map((channel) => {
              const alreadyAdded = isTrusted(channel, trusted);
              return (
                <div key={channel.url} className="flex items-center gap-3 px-3 py-2.5">
                  <ChannelAvatar
                    src={proxyImage(channel.thumbnailUrl)}
                    name={channel.name}
                    className="h-10 w-10"
                  />
                  <div className="min-w-0 flex-1">
                    <ChannelRouteLink
                      url={channel.url}
                      className="truncate text-sm font-medium text-fg hover:underline"
                    >
                      {channel.name}
                    </ChannelRouteLink>
                    <p className="truncate text-xs text-fg-soft">
                      {formatSubscribers(channel.subscriberCount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={alreadyAdded || pending}
                    onClick={() => onAdd(channel)}
                    className={`h-8 shrink-0 border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      alreadyAdded
                        ? "border-border text-fg-soft"
                        : "border-fg bg-fg text-app hover:bg-fg-strong"
                    }`}
                  >
                    {alreadyAdded ? "Added" : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
