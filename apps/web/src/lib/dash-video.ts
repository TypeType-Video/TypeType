import type * as dashjs from "dashjs";
import { notifyDashPlayer, setDashVideoTrack } from "./dash-player-store";
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
  for (const track of player.getTracksFor("video")) {
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

function activeRepresentationHeight(
  player: dashjs.MediaPlayerClass,
  track: dashjs.MediaInfo,
): number | null {
  const currentTrack = player.getCurrentTrackFor("video");
  const currentFamily = codecFamily(currentTrack?.codec ?? null);
  const trackFamily = codecFamily(track.codec);
  if (currentFamily !== trackFamily) return null;
  return player.getCurrentRepresentationForType("video")?.height ?? null;
}

function applyDashHeight(player: dashjs.MediaPlayerClass, height: number): void {
  const representationIndex = player
    .getRepresentationsByType("video")
    .findIndex((candidate) => candidate.height === height);
  if (representationIndex < 0) return;
  player.updateSettings({
    streaming: {
      abr: {
        autoSwitchBitrate: { video: false },
      },
    },
  });
  player.setRepresentationForTypeByIndex("video", representationIndex, true);
}

export function selectDashTrack(
  player: dashjs.MediaPlayerClass,
  track: dashjs.MediaInfo,
  height = maxTrackHeight(track),
): void {
  setDashVideoTrack(track);
  player.setCurrentTrack(track, true);
  notifyDashPlayer();
  const apply = () => {
    player.setCurrentTrack(track, true);
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
