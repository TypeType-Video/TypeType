import { useCallback, useEffect, useState } from "react";

type PositionRef = {
  current: number;
};

export function playerErrorResumePosition(
  positionMs: number,
  recoveryPositionMs: number | undefined,
  durationMs: number,
): number {
  const candidate =
    recoveryPositionMs !== undefined && Number.isFinite(recoveryPositionMs)
      ? recoveryPositionMs
      : positionMs;
  if (candidate < 5000 || candidate >= durationMs * 0.95) return 0;
  return Math.round(candidate);
}

export function usePlayerErrorResume(
  streamId: string,
  duration: number,
  positionRef: PositionRef,
  onError: () => void,
) {
  const [retryStartTime, setRetryStartTime] = useState(0);

  useEffect(() => {
    if (streamId.length > 0) setRetryStartTime(0);
  }, [streamId]);

  const handlePlayerError = useCallback(
    (recoveryPositionMs?: number) => {
      const position = playerErrorResumePosition(
        positionRef.current,
        recoveryPositionMs,
        duration * 1000,
      );
      if (position > 0) setRetryStartTime(position);
      onError();
    },
    [duration, onError, positionRef],
  );

  return { retryStartTime, handlePlayerError };
}
