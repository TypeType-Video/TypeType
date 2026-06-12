import { Clock3, MessageCircle, Share2, Star } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useFavoritesPlaylist } from "../hooks/use-favorites-playlist";
import { useShareUrl } from "../hooks/use-share-url";
import { useWatchLaterPlaylist } from "../hooks/use-watch-later-playlist";
import { toPublicWatchUrl } from "../lib/watch-url";
import type { VideoStream } from "../types/stream";
import { ShortsActionButton } from "./shorts-action-button";

type Props = {
  stream: VideoStream;
  onOpenComments: () => void;
  className?: string;
  compact?: boolean;
  showComments?: boolean;
};

export function ShortsActions({
  stream,
  onOpenComments,
  className,
  compact,
  showComments = true,
}: Props) {
  const { isAuthed } = useAuth();
  const { copied, share } = useShareUrl();
  const {
    add: addFavorite,
    remove: removeFavorite,
    isInFavorites,
    isPending: favoritesPending,
  } = useFavoritesPlaylist();
  const {
    add: addWatchLater,
    remove: removeWatchLater,
    isInWatchLater,
    isPending: watchLaterPending,
  } = useWatchLaterPlaylist();

  const favorited = isInFavorites(stream.id);
  const watchLater = isInWatchLater(stream.id);

  function requireAuth(): boolean {
    if (isAuthed) return true;
    const redirect = `/shorts?v=${encodeURIComponent(stream.id)}`;
    window.location.assign(`/login?redirect=${encodeURIComponent(redirect)}`);
    return false;
  }

  async function toggleFavorite() {
    if (!requireAuth()) return;
    if (favorited) {
      await removeFavorite(stream.id);
      return;
    }
    await addFavorite({
      url: stream.id,
      title: stream.title,
      thumbnail: stream.rawThumbnail || stream.thumbnail,
      duration: stream.duration,
    });
  }

  async function toggleWatchLater() {
    if (!requireAuth()) return;
    if (watchLater) {
      await removeWatchLater(stream.id);
      return;
    }
    await addWatchLater({
      url: stream.id,
      title: stream.title,
      thumbnail: stream.rawThumbnail || stream.thumbnail,
      duration: stream.duration,
    });
  }

  function handleShare() {
    void share(toPublicWatchUrl(stream.id, window.location.origin));
  }

  return (
    <div className={`pointer-events-auto flex flex-col items-center gap-3 ${className ?? ""}`}>
      <ShortsActionButton
        icon={Star}
        label="Favorite"
        stateLabel={favorited ? "Saved" : "Save"}
        active={favorited}
        disabled={favoritesPending}
        compact={compact}
        onClick={() => void toggleFavorite()}
      />
      <ShortsActionButton
        icon={Clock3}
        label="Watch later"
        stateLabel={watchLater ? "Saved" : "Watch Later"}
        active={watchLater}
        disabled={watchLaterPending}
        compact={compact}
        onClick={() => void toggleWatchLater()}
      />
      {showComments && (
        <ShortsActionButton
          icon={MessageCircle}
          label="Comments"
          compact={compact}
          onClick={onOpenComments}
        />
      )}
      <ShortsActionButton
        icon={Share2}
        label="Share"
        stateLabel={copied ? "Copied" : "Link"}
        compact={compact}
        onClick={handleShare}
      />
    </div>
  );
}
