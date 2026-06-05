import { useCallback, useEffect, useState } from "react";

type PositionRef = {
  current: number;
};

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

  const handlePlayerError = useCallback(() => {
    const position = positionRef.current;
    const durationMs = duration * 1000;
    if (position >= 5000 && position < durationMs * 0.95) setRetryStartTime(position);
    onError();
  }, [duration, onError, positionRef]);

  return { retryStartTime, handlePlayerError };
}
