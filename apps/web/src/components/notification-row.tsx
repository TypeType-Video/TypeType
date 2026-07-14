import { Link } from "@tanstack/react-router";
import { useClientLocale } from "../hooks/use-client-locale";
import { useDeArrowBranding } from "../hooks/use-dearrow";
import { formatPublishedDate } from "../lib/format";
import { proxyImage } from "../lib/proxy";
import { watchRouteSearch } from "../lib/watch-url";
import type { NotificationItem } from "../types/notifications";

type Props = {
  item: NotificationItem;
  onOpen: () => void;
};

export function NotificationRow({ item, onOpen }: Props) {
  const locale = useClientLocale();
  const videoId = item.video.url.trim().length > 0 ? item.video.url : item.video.id;
  const publishedAt =
    typeof item.publishedAt === "number" && item.publishedAt > 0
      ? item.publishedAt
      : item.video.publishedAt;
  const createdText = formatPublishedDate(publishedAt ?? undefined, undefined, locale) || "recent";
  const branding = useDeArrowBranding(
    videoId,
    item.video.title,
    proxyImage(item.video.thumbnailUrl),
  );

  return (
    <Link
      to="/watch"
      search={watchRouteSearch(videoId)}
      className="grid grid-cols-[96px_1fr] gap-3 rounded-lg px-2 py-2 hover:bg-surface-strong [animation:card-pop-in_0.24s_ease-out]"
      onClick={onOpen}
    >
      <img
        src={branding.thumbnail}
        alt={branding.title}
        className="h-[54px] w-24 rounded object-cover"
        loading="lazy"
      />
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm font-medium leading-tight text-fg">{branding.title}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <img
            src={proxyImage(item.channelAvatarUrl)}
            alt={item.channelName}
            className="h-4 w-4 rounded-full"
            loading="lazy"
          />
          <span className="truncate text-xs text-fg-muted">{item.channelName}</span>
          <span className="text-xs text-fg-soft">{createdText}</span>
        </div>
      </div>
    </Link>
  );
}
