import { type ReactNode, useEffect, useRef, useState } from "react";
import { AudioOnlyPoster } from "./audio-only-poster";

type Snapshot = {
  id: number;
  poster?: string;
  title?: string;
};

type Props = {
  audioOnly: boolean;
  poster?: string;
  title?: string;
  children: ReactNode;
};

export function WatchPlayerCrossfade({ audioOnly, poster, title, children }: Props) {
  const previousAudioOnly = useRef(audioOnly);
  const timeoutRef = useRef<number | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    const leavingAudio = previousAudioOnly.current && !audioOnly;
    previousAudioOnly.current = audioOnly;

    if (leavingAudio) {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      setSnapshot({ id: Date.now(), poster, title });
      timeoutRef.current = window.setTimeout(() => {
        setSnapshot(null);
        timeoutRef.current = null;
      }, 560);
      return;
    }

    if (audioOnly) {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setSnapshot(null);
    }
  }, [audioOnly, poster, title]);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  return (
    <>
      {children}
      {snapshot ? (
        <div key={snapshot.id} className="typetype-player-mode-fade-overlay" aria-hidden="true">
          <AudioOnlyPoster poster={snapshot.poster} title={snapshot.title} />
          <div className="typetype-player-mode-control-ghost">
            <div className="typetype-player-mode-control-progress" />
            <div className="typetype-player-mode-control-row">
              <span />
              <span />
              <span />
              <b />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
