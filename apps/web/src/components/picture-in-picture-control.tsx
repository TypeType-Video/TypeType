import { useEffect, useState } from "react";
import { recordClientEvent } from "../lib/client-debug-log";
import { PictureInPictureExitIcon, PictureInPictureIcon, useMediaPlayer } from "../lib/vidstack";

export function PictureInPictureControl() {
  const player = useMediaPlayer();
  const [media, setMedia] = useState<HTMLVideoElement | null>(null);
  const [active, setActive] = useState(false);
  const supported = media && typeof media.requestPictureInPicture === "function";

  useEffect(() => {
    const root = player?.el;
    if (!root) return;
    const sync = () => setMedia(root.querySelector("video"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [player]);

  useEffect(() => {
    if (!media) return;
    const sync = () => setActive(document.pictureInPictureElement === media);
    sync();
    media.addEventListener("enterpictureinpicture", sync);
    media.addEventListener("leavepictureinpicture", sync);
    return () => {
      media.removeEventListener("enterpictureinpicture", sync);
      media.removeEventListener("leavepictureinpicture", sync);
    };
  }, [media]);

  async function toggle() {
    if (!media || !supported) return;
    try {
      if (document.pictureInPictureElement === media) {
        if (typeof document.exitPictureInPicture === "function") {
          await document.exitPictureInPicture();
        }
        return;
      }
      await media.requestPictureInPicture();
    } catch (error) {
      recordClientEvent("player.pip_error", {
        message: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white/90 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      aria-label={active ? "Exit picture in picture" : "Enter picture in picture"}
      aria-pressed={active}
      title={active ? "Exit picture in picture" : "Enter picture in picture"}
      onClick={() => {
        void toggle();
      }}
    >
      {active ? (
        <PictureInPictureExitIcon className="h-5 w-5" />
      ) : (
        <PictureInPictureIcon className="h-5 w-5" />
      )}
    </button>
  );
}
