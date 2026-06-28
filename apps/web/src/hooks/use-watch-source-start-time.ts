import type { MutableRefObject } from "react";
import { useRef } from "react";

type Args = {
  streamId: string;
  sourceKey: string;
  startTime: number;
  positionRef: MutableRefObject<number>;
};

type SourceState = {
  streamId: string;
  sourceKey: string;
  requestedStartTime: number;
  revision: number;
  startTime: number;
};

function validPosition(position: number) {
  return Number.isFinite(position) ? Math.max(0, position) : 0;
}

export function useWatchSourceStartTime({ streamId, sourceKey, startTime, positionRef }: Args) {
  const stateRef = useRef<SourceState | null>(null);
  const requestedStartTime = validPosition(startTime);
  const currentPosition = validPosition(positionRef.current);
  const state = stateRef.current;

  if (!state || state.streamId !== streamId) {
    stateRef.current = {
      streamId,
      sourceKey,
      requestedStartTime,
      revision: 0,
      startTime: requestedStartTime,
    };
  } else if (state.sourceKey !== sourceKey) {
    stateRef.current = {
      streamId,
      sourceKey,
      requestedStartTime,
      revision: state.revision + 1,
      startTime: currentPosition > 0 ? currentPosition : requestedStartTime,
    };
  } else if (requestedStartTime !== state.requestedStartTime) {
    stateRef.current = {
      ...state,
      requestedStartTime,
      startTime: requestedStartTime,
    };
  }

  const current = stateRef.current;
  if (!current) return { keyPart: `${sourceKey}:0`, startTime: requestedStartTime };

  return {
    keyPart: `${current.sourceKey}:${current.revision}`,
    startTime: current.startTime,
  };
}
