import { type MouseEvent, useState } from "react";
import { ChannelAvatar } from "../components/channel-avatar";
import { useBlocked } from "../hooks/use-blocked";
import type { BlockedItem } from "../types/user";

const SECTION_LABEL = "text-xs font-medium text-fg-soft uppercase tracking-wider px-1";

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

type ChannelBubbleProps = {
  item: BlockedItem;
  onClick: () => void;
  onRemove: (event: MouseEvent<HTMLButtonElement>) => void;
};

function ChannelBubble({ item, onClick, onRemove }: ChannelBubbleProps) {
  const label = item.name ?? item.url;
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        title={label}
        className="block rounded-full focus:outline-none focus:ring-2 focus:ring-border-strong"
      >
        <ChannelAvatar
          src={item.thumbnailUrl ?? ""}
          name={label}
          className="w-12 h-12 opacity-80 group-hover:opacity-100 transition-opacity"
        />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Unblock ${label}`}
        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-surface-strong hover:bg-danger border border-border-strong text-fg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <XIcon />
      </button>
    </div>
  );
}

type ModalProps = {
  item: BlockedItem;
  onUnblock: () => void;
  onClose: () => void;
};

function BlockedChannelModal({ item, onUnblock, onClose }: ModalProps) {
  const label = item.name ?? item.url;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative bg-surface border border-border rounded-2xl p-6 flex flex-col items-center gap-4 w-64">
        <ChannelAvatar src={item.thumbnailUrl ?? ""} name={label} className="w-16 h-16" />
        <p className="text-sm text-fg font-medium text-center break-all">{label}</p>
        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-9 rounded-lg text-xs text-fg-muted hover:text-fg hover:bg-surface-strong transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onUnblock}
            className="flex-1 h-9 rounded-lg text-xs text-danger hover:text-danger-strong hover:bg-surface-strong transition-colors"
          >
            Unblock
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsBlocked() {
  const { channels, videos, removeChannel, removeVideo } = useBlocked();
  const [selected, setSelected] = useState<BlockedItem | null>(null);

  const channelList = channels.data ?? [];
  const videoList = videos.data ?? [];

  if (channelList.length === 0 && videoList.length === 0) return null;

  return (
    <>
      {channelList.length > 0 && (
        <section className="flex flex-col gap-3">
          <p className={SECTION_LABEL}>Blocked channels</p>
          <div className="flex flex-wrap gap-3 px-1">
            {channelList.map((item) => (
              <ChannelBubble
                key={item.url}
                item={item}
                onClick={() => setSelected(item)}
                onRemove={(event) => {
                  event.stopPropagation();
                  removeChannel.mutate(item.url);
                }}
              />
            ))}
          </div>
        </section>
      )}
      {videoList.length > 0 && (
        <section className="flex flex-col gap-3">
          <p className={SECTION_LABEL}>Blocked videos</p>
          <div className="bg-surface rounded-xl border border-border overflow-hidden divide-y divide-border">
            {videoList.map((item) => (
              <div key={item.url} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-xs text-fg-muted truncate flex-1 min-w-0">{item.url}</span>
                <button
                  type="button"
                  onClick={() => removeVideo.mutate(item.url)}
                  aria-label={`Unblock ${item.url}`}
                  className="flex-shrink-0 text-fg-soft hover:text-fg transition-colors p-1 rounded hover:bg-surface-strong"
                >
                  <XIcon />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      {selected !== null && (
        <BlockedChannelModal
          item={selected}
          onUnblock={() => {
            removeChannel.mutate(selected.url);
            setSelected(null);
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
