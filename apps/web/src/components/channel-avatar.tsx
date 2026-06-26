import { useState } from "react";

type Props = {
  src: string;
  name: string;
  className?: string;
};

function getInitial(name: string): string {
  if (!name) return "?";
  if (name.startsWith("http")) {
    try {
      const segments = new URL(name).pathname.split("/").filter(Boolean);
      const last = segments.pop() ?? "";
      return (last.replace("@", "")[0] ?? "?").toUpperCase();
    } catch {
      return "?";
    }
  }
  return name[0].toUpperCase();
}

export function ChannelAvatar({ src, name, className = "w-8 h-8" }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;

  if (!src || failed) {
    return (
      <div
        className={`${className} flex flex-shrink-0 select-none items-center justify-center rounded-full border border-border bg-gradient-to-br from-surface-strong to-surface-soft font-semibold text-fg-muted`}
        title={name}
      >
        <span className="text-base leading-none">{getInitial(name)}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={`${className} flex-shrink-0 rounded-full object-cover`}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(src)}
      title={name}
    />
  );
}
