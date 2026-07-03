export function videoPlayerClassName(audioOnly: boolean, className?: string): string {
  return [
    "w-full h-full dark typetype-player-surface",
    audioOnly && "typetype-audio-only-player",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
