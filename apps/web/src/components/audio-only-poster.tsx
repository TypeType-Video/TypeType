import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useAudioPalette } from "../hooks/use-audio-palette";
import { proxyImage } from "../lib/proxy";
import { AudioOnlyVisualizer } from "./audio-only-visualizer";

type Props = {
  poster?: string;
  title?: string;
};

type PaletteStyle = CSSProperties & {
  "--typetype-audio-primary": string;
  "--typetype-audio-secondary": string;
  "--typetype-audio-ambient": string;
  "--typetype-audio-wave-top": string;
  "--typetype-audio-wave-mid": string;
  "--typetype-audio-wave-bottom": string;
};

export function AudioOnlyPoster({ poster, title }: Props) {
  const image = poster ? proxyImage(poster) : "";
  const palette = useAudioPalette(image);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleTextRef = useRef<HTMLSpanElement>(null);
  const [shouldMarquee, setShouldMarquee] = useState(false);

  useEffect(() => {
    const titleElement = titleRef.current;
    const textElement = titleTextRef.current;
    if (!titleElement || !textElement) return;

    const measureTitle = () => {
      setShouldMarquee(textElement.scrollWidth > titleElement.clientWidth + 8);
    };

    measureTitle();

    const observer = new ResizeObserver(measureTitle);
    observer.observe(titleElement);
    observer.observe(textElement);
    return () => observer.disconnect();
  }, []);

  const titleClassName = [
    "typetype-audio-poster-title line-clamp-2 max-w-lg text-balance font-semibold text-base leading-tight text-white drop-shadow-2xl sm:text-2xl lg:text-3xl",
    shouldMarquee ? "typetype-audio-poster-title-marquee" : null,
  ]
    .filter(Boolean)
    .join(" ");
  const style: PaletteStyle = {
    "--typetype-audio-primary": palette.primary,
    "--typetype-audio-secondary": palette.secondary,
    "--typetype-audio-ambient": palette.ambient,
    "--typetype-audio-wave-top": palette.waveTop,
    "--typetype-audio-wave-mid": palette.waveMid,
    "--typetype-audio-wave-bottom": palette.waveBottom,
  };

  return (
    <div
      className="typetype-audio-poster pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={style}
    >
      {image ? (
        <>
          <img
            src={image}
            alt=""
            className="typetype-audio-poster-backdrop absolute inset-0 h-full w-full scale-110 object-cover blur-3xl"
          />
          <div className="typetype-audio-poster-tint absolute inset-0" />
          <AudioOnlyVisualizer />
          <div className="absolute inset-0 flex items-center justify-center px-5 pt-5 pb-20 sm:px-10 sm:pt-8 sm:pb-24">
            <div className="relative flex w-full max-w-3xl items-center justify-start gap-4 text-left sm:gap-7">
              <img
                src={image}
                alt={title ?? "Audio only"}
                className="h-20 w-20 shrink-0 rounded-2xl object-cover shadow-[0_22px_70px_rgb(0_0_0/0.58)] ring-1 ring-white/15 sm:h-40 sm:w-40 sm:rounded-3xl md:h-48 md:w-48"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-5">
                <div ref={titleRef} className={titleClassName}>
                  <span ref={titleTextRef}>{title ?? "Audio only playback"}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_25%,rgba(239,68,68,0.16),transparent_38%),linear-gradient(to_bottom,#09090b,#000)] px-6 pb-24 text-center text-2xl font-semibold text-white sm:text-4xl">
          {title ?? "Audio only playback"}
        </div>
      )}
    </div>
  );
}
