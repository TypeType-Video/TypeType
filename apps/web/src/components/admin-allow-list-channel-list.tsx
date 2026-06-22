import { channelRoutePath } from "../lib/channel-route-url";
import type { AllowedChannelItem } from "../types/user";
import { ChannelAvatar } from "./channel-avatar";
import { ChannelRouteLink } from "./channel-route-link";

function XIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="8"
      height="8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

type Props = {
  title?: string;
  channels: AllowedChannelItem[];
  onRemove?: (url: string) => void;
};

export function AdminAllowListChannelList({
  title = "Allowed channels",
  channels,
  onRemove,
}: Props) {
  return (
    <section className="border-t border-border pt-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-fg">{title}</h2>
          <p className="mt-1 text-xs text-fg-soft">
            Channels available when allow-list mode is enabled.
          </p>
        </div>
        <span className="text-xs text-fg-soft">
          {channels.length} {channels.length === 1 ? "channel" : "channels"}
        </span>
      </div>
      {channels.length === 0 ? (
        <p className="py-3 text-sm text-fg-soft">No channels added.</p>
      ) : (
        <div className="border-y border-border">
          {channels.map((item) => {
            const label = item.name ?? item.url;
            const typeTypeUrl = channelRoutePath(item.url);
            return (
              <div
                key={item.url}
                className="group relative flex items-center gap-3 border-b border-border px-0 py-3 last:border-b-0"
              >
                <ChannelAvatar
                  src={item.thumbnailUrl ?? ""}
                  name={label}
                  className="h-9 w-9 shrink-0 opacity-90"
                />
                <div className="min-w-0 flex-1">
                  <ChannelRouteLink
                    url={item.url}
                    className="block truncate text-xs font-medium text-fg hover:underline"
                  >
                    {label}
                  </ChannelRouteLink>
                  <ChannelRouteLink
                    url={item.url}
                    className="block truncate text-[10px] text-fg-soft hover:text-fg-muted"
                  >
                    {typeTypeUrl}
                  </ChannelRouteLink>
                </div>
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(item.url)}
                    aria-label={`Remove ${label}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center text-fg-soft transition-colors hover:text-fg"
                  >
                    <XIcon />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
