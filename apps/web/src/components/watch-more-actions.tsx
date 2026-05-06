import { useRef, useState } from "react";
import { useBlocked } from "../hooks/use-blocked";
import { goto } from "../lib/route-redirect";
import type { VideoStream } from "../types/stream";
import { VideoBlockActionsDropdown } from "./video-block-actions-dropdown";
import { MoreIcon } from "./watch-icons";

type Props = {
  stream: VideoStream;
  isAuthed: boolean;
  onSaved: (label: string) => void;
  className: string;
};

export function WatchMoreActions({ stream, isAuthed, onSaved, className }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnchorRef = useRef<HTMLButtonElement>(null);
  const { channels, videos, addChannel, removeChannel, addVideo, removeVideo } = useBlocked();
  const channelBlocked =
    !!stream.channelUrl &&
    (channels.data ?? []).some((blocked) => blocked.url === stream.channelUrl);
  const videoBlocked = (videos.data ?? []).some((blocked) => blocked.url === stream.id);

  function ensureAuth(): boolean {
    if (isAuthed) return true;
    goto("/");
    return false;
  }

  function toggleVideoBlock() {
    if (!ensureAuth()) return;
    if (videoBlocked) {
      removeVideo.mutate(stream.id);
      onSaved("Video unblocked");
      return;
    }
    addVideo.mutate({ url: stream.id, global: false });
    onSaved("Video blocked");
  }

  function toggleChannelBlock() {
    if (!stream.channelUrl || !ensureAuth()) return;
    if (channelBlocked) {
      removeChannel.mutate(stream.channelUrl);
      onSaved("Channel unblocked");
      return;
    }
    addChannel.mutate({
      url: stream.channelUrl,
      name: stream.channelName,
      thumbnailUrl: stream.channelAvatar,
      global: false,
    });
    onSaved(`Channel blocked: ${stream.channelName}`);
  }

  return (
    <>
      <button
        ref={menuAnchorRef}
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className={className}
      >
        <MoreIcon />
        More
      </button>
      {menuOpen && (
        <VideoBlockActionsDropdown
          anchorEl={menuAnchorRef.current}
          onClose={() => setMenuOpen(false)}
          onToggleVideoBlock={toggleVideoBlock}
          onToggleChannelBlock={stream.channelUrl ? toggleChannelBlock : undefined}
          videoBlocked={videoBlocked}
          channelBlocked={channelBlocked}
        />
      )}
    </>
  );
}
