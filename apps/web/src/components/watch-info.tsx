import { useEffect, useState } from "react";
import { useClientLocale } from "../hooks/use-client-locale";
import { useSubscriptions } from "../hooks/use-subscriptions";
import { formatPublishedDate, formatSubscribers, formatViews } from "../lib/format";
import type { VideoStream } from "../types/stream";
import { ChannelAvatar } from "./channel-avatar";
import { ChannelRouteLink } from "./channel-route-link";
import { Toast } from "./toast";
import { VerifiedBadgeIcon } from "./watch-icons";
import { WatchLikeDislike } from "./watch-like-dislike";

type Props = {
  stream: VideoStream;
};

export function WatchInfo({ stream }: Props) {
  const locale = useClientLocale();
  const { add, remove, isSubscribed } = useSubscriptions();
  const subscribed = stream.channelUrl ? isSubscribed(stream.channelUrl) : false;
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const publishedText = formatPublishedDate(stream.publishedAt, undefined, locale);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 2000);
    return () => clearTimeout(t);
  }, [toastMsg]);

  async function handleSubscribe() {
    if (!stream.channelUrl) return;
    try {
      if (subscribed) {
        await remove.mutateAsync(stream.channelUrl);
        setToastMsg(`Unsubscribed from ${stream.channelName}`);
      } else {
        await add.mutateAsync({
          channelUrl: stream.channelUrl,
          name: stream.channelName,
          avatarUrl: stream.channelAvatar,
        });
        setToastMsg(`Subscribed to ${stream.channelName}`);
      }
    } catch {
      setToastMsg("Subscription update failed");
    }
  }

  const channelMeta = (
    <div className="flex flex-col min-w-0">
      <p className="text-sm font-medium text-fg truncate flex items-center gap-1">
        {stream.channelName}
        {stream.uploaderVerified && <VerifiedBadgeIcon />}
      </p>
      <p className="text-xs text-fg-soft">
        {formatSubscribers(stream.uploaderSubscriberCount)}
        {publishedText && ` · ${publishedText}`}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-base font-semibold text-fg leading-snug">{stream.title}</h1>
        <span className="text-sm text-fg-muted flex-shrink-0 mt-0.5">
          {formatViews(stream.views)}
        </span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {stream.channelUrl ? (
            <ChannelRouteLink
              url={stream.channelUrl}
              className="flex items-center gap-3 min-w-0 group"
            >
              <ChannelAvatar
                src={stream.channelAvatar}
                name={stream.channelName}
                className="w-9 h-9"
              />
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-medium text-fg truncate group-hover:underline flex items-center gap-1">
                  {stream.channelName}
                  {stream.uploaderVerified && <VerifiedBadgeIcon />}
                </p>
                <p className="text-xs text-fg-soft">
                  {formatSubscribers(stream.uploaderSubscriberCount)}
                  {publishedText && ` · ${publishedText}`}
                </p>
              </div>
            </ChannelRouteLink>
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <ChannelAvatar
                src={stream.channelAvatar}
                name={stream.channelName}
                className="w-9 h-9"
              />
              {channelMeta}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 flex-shrink-0 sm:justify-start">
          <WatchLikeDislike stream={stream} />
          {stream.channelUrl && (
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={add.isPending || remove.isPending}
              aria-pressed={subscribed}
              className={`flex-shrink-0 px-4 py-1.5 text-sm font-medium rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:ring-border disabled:opacity-50 disabled:cursor-not-allowed ${
                subscribed
                  ? "ring-1 ring-border-strong bg-surface-strong text-fg hover:bg-surface-soft"
                  : "bg-fg text-app hover:bg-white"
              }`}
            >
              {subscribed ? "Subscribed" : "Subscribe"}
            </button>
          )}
        </div>
      </div>
      <div className="h-px bg-surface-strong" />
      <Toast message={toastMsg} />
    </div>
  );
}
