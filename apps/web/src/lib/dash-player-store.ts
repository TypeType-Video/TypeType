import type * as dashjs from "dashjs";
import { useSyncExternalStore } from "react";

type Listener = () => void;

type DashPlayerSnapshot = {
  player: dashjs.MediaPlayerClass | null;
  selectedVideoTrack: dashjs.MediaInfo | null;
  version: number;
};

const listeners = new Set<Listener>();
let player: dashjs.MediaPlayerClass | null = null;
let selectedVideoTrack: dashjs.MediaInfo | null = null;
let snapshot: DashPlayerSnapshot = { player: null, selectedVideoTrack: null, version: 0 };

function emit(): void {
  snapshot = { player, selectedVideoTrack, version: snapshot.version + 1 };
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): DashPlayerSnapshot {
  return snapshot;
}

export function setDashPlayer(next: dashjs.MediaPlayerClass | null): void {
  if (player === next) return;
  player = next;
  selectedVideoTrack = null;
  emit();
}

export function setDashVideoTrack(next: dashjs.MediaInfo | null): void {
  selectedVideoTrack = next;
  emit();
}

export function notifyDashPlayer(): void {
  emit();
}

export function useDashPlayerSnapshot(): DashPlayerSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
