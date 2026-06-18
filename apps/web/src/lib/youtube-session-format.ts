import type { YoutubeSessionStatus } from "./api-youtube-session";

export function youtubeSessionStatusLabel(status: YoutubeSessionStatus | undefined): string {
  if (status === "connected") return "Connected";
  if (status === "needs_reconnect") return "Reconnect needed";
  return "Not connected";
}

export function youtubeSessionStatusDescription(status: YoutubeSessionStatus | undefined): string {
  if (status === "connected") return "TypeType can use this session when extraction needs it.";
  if (status === "needs_reconnect")
    return "YouTube rejected the stored session. Create a new code.";
  return "No YouTube session is connected.";
}

export function formatSessionTime(value: number | undefined): string {
  if (!value) return "Never";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}
