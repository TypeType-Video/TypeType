import type * as dashjs from "dashjs";
import { isCurrentDashPlayer, notifyDashPlayer, setDashVideoTrack } from "./dash-player-store";
import { type CodecFamily, codecFamily } from "./quality-utils";

export type DashQualityOption = {
  label: string;
  value: string;
  height: number;
  bandwidth: number;
  selected: boolean;
};

export function maxTrackHeight(track: dashjs.MediaInfo): number {
  return Math.max(0, ...track.bitrateList.map((bitrate) => bitrate.height ?? 0));
}

export function dashTrackGroups(
  player: dashjs.MediaPlayerClass,
): Map<CodecFamily, dashjs.MediaInfo> {
  const groups = new Map<CodecFamily, dashjs.MediaInfo>();
  if (!isCurrentDashPlayer(player)) return groups;

  let tracks: ReturnType<dashjs.MediaPlayerClass["getTracksFor"]>;
  try {
    tracks = player.getTracksFor("video");
  } catch {
    return groups;
  }

  for (const track of tracks) {
    const family = codecFamily(track.codec);
    if (!family) continue;
    const current = groups.get(family);
    if (!current || maxTrackHeight(track) > maxTrackHeight(current)) groups.set(family, track);
  }
  return groups;
}

export function dashQualityOptions(
  track: dashjs.MediaInfo,
  selectedHeight: number | null,
): DashQualityOption[] {
  const grouped = new Map<number, { height: number; bandwidth: number }>();
  for (const bitrate of track.bitrateList) {
    const height = bitrate.height ?? 0;
    if (height <= 0) continue;
    const bandwidth = bitrate.bandwidth ?? 0;
    const current = grouped.get(height);
    if (!current || bandwidth > current.bandwidth) grouped.set(height, { height, bandwidth });
  }
  return [...grouped.values()]
    .sort((left, right) => right.height - left.height || right.bandwidth - left.bandwidth)
    .map((option) => ({
      label: `${option.height}p`,
      value: String(option.height),
      height: option.height,
      bandwidth: option.bandwidth,
      selected: option.height === selectedHeight,
    }));
}

export function dashVideoTrack(player: dashjs.MediaPlayerClass): dashjs.MediaInfo | null {
  if (!isCurrentDashPlayer(player)) return null;
  try {
    return player.getCurrentTrackFor("video");
  } catch {
    return null;
  }
}

function activeRepresentationHeight(
  player: dashjs.MediaPlayerClass,
  track: dashjs.MediaInfo,
): number | null {
  const currentTrack = dashVideoTrack(player);
  const currentFamily = codecFamily(currentTrack?.codec ?? null);
  const trackFamily = codecFamily(track.codec);
  if (currentFamily !== trackFamily) return null;
  try {
    return player.getCurrentRepresentationForType("video")?.height ?? null;
  } catch {
    return null;
  }
}

function applyDashHeight(player: dashjs.MediaPlayerClass, height: number): void {
  if (!isCurrentDashPlayer(player)) return;

  let representations: ReturnType<dashjs.MediaPlayerClass["getRepresentationsByType"]>;
  try {
    representations = player.getRepresentationsByType("video");
  } catch {
    return;
  }

  const representation = representations.find((candidate) => candidate.height === height);
  if (!representation) return;
  try {
    player.setRepresentationForTypeByIndex("video", representation.index, true);
  } catch {
    return;
  }
}

function applyDashTrack(player: dashjs.MediaPlayerClass, track: dashjs.MediaInfo): boolean {
  if (!isCurrentDashPlayer(player)) return false;
  try {
    player.setCurrentTrack(track, true);
    return true;
  } catch {
    setDashVideoTrack(null);
    notifyDashPlayer();
    return false;
  }
}

export function selectDashTrack(
  player: dashjs.MediaPlayerClass,
  track: dashjs.MediaInfo,
  height = maxTrackHeight(track),
): void {
  if (!applyDashTrack(player, track)) return;
  setDashVideoTrack(track);
  notifyDashPlayer();
  const apply = () => {
    if (!applyDashTrack(player, track)) return;
    applyDashHeight(player, height);
    notifyDashPlayer();
  };
  window.setTimeout(apply, 120);
  window.setTimeout(apply, 650);
}

export function selectedDashHeight(
  player: dashjs.MediaPlayerClass,
  track: dashjs.MediaInfo,
): number | null {
  return activeRepresentationHeight(player, track);
}
