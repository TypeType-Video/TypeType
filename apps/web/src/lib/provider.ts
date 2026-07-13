type Provider = "youtube" | "nicovideo" | "bilibili" | "unknown";

export function detectProvider(url: string): Provider {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("nicovideo.jp") || url.includes("nico.ms")) return "nicovideo";
  if (url.includes("bilibili.com") || url.includes("b23.tv")) return "bilibili";
  return "unknown";
}
