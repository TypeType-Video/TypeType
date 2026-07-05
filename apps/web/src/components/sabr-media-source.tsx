import { useEffect, useRef } from "react";
import { SabrMseController } from "../lib/sabr-mse-controller";
import { sabrSessionConfig } from "../lib/sabr-source";
import type { MediaProviderAdapter, MediaSrc } from "../lib/vidstack";
import { useMediaProvider } from "../lib/vidstack";
import { useSabrQualityStore } from "../stores/sabr-quality-store";

function providerVideo(provider: MediaProviderAdapter | null): HTMLVideoElement | null {
  if (!provider || !("video" in provider)) return null;
  const candidate = provider.video;
  return candidate instanceof HTMLVideoElement ? candidate : null;
}

function mediaTimeMs(media: HTMLVideoElement): number {
  const timeMs = media.currentTime * 1000;
  return Number.isFinite(timeMs) ? Math.max(0, Math.round(timeMs)) : 0;
}

type Props = {
  src: MediaSrc;
  startTime: number;
  autoplay: boolean;
  onError: () => void;
};

export function SabrMediaSource({ src, startTime, autoplay, onError }: Props) {
  const provider = useMediaProvider();
  const media = providerVideo(provider);
  const config = sabrSessionConfig(src);
  const selectedItag = useSabrQualityStore((state) =>
    config ? (state.selected[config.id] ?? config.videoItag) : null,
  );
  const setActiveSource = useSabrQualityStore((state) => state.setActiveSource);
  const clearActiveSource = useSabrQualityStore((state) => state.clearActiveSource);
  const selectedQuality = config?.qualities.find((quality) => quality.itag === selectedItag);
  const audioItag = config?.audioItag ?? null;
  const configId = config?.id ?? null;
  const descriptorUrl = selectedQuality?.descriptorUrl ?? config?.descriptorUrl ?? null;
  const durationMs = config?.durationMs ?? null;
  const videoItag = selectedQuality?.itag ?? config?.videoItag ?? null;
  const onErrorRef = useRef(onError);
  const resumeRef = useRef<{ configId: string; timeMs: number } | null>(null);
  const startRef = useRef<{ configId: string; timeMs: number } | null>(null);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!config) return;
    setActiveSource(config.id, config.qualities, config.videoItag);
    return () => clearActiveSource(config.id);
  }, [clearActiveSource, config, setActiveSource]);

  useEffect(() => {
    if (media && !config) onErrorRef.current();
    if (!media || !configId || !descriptorUrl || videoItag === null || durationMs === null) return;
    const requestedStartTimeMs = Math.max(0, Math.round(startTime));
    const heldStart = startRef.current;
    if (!heldStart || heldStart.configId !== configId || requestedStartTimeMs > heldStart.timeMs) {
      startRef.current = { configId, timeMs: requestedStartTimeMs };
    }
    const resume = resumeRef.current;
    const resumeTimeMs = resume?.configId === configId ? resume.timeMs : 0;
    const heldStartTimeMs = startRef.current?.configId === configId ? startRef.current.timeMs : 0;
    const controller = new SabrMseController({
      media,
      config: { audioItag, descriptorUrl, durationMs, id: configId, qualities: [], videoItag },
      startTime: resumeTimeMs > 0 ? resumeTimeMs : heldStartTimeMs,
      autoplay,
      onError: () => onErrorRef.current(),
    });
    controller.start();
    return () => {
      resumeRef.current = { configId, timeMs: mediaTimeMs(media) };
      controller.dispose();
    };
  }, [
    audioItag,
    autoplay,
    config,
    configId,
    descriptorUrl,
    durationMs,
    media,
    startTime,
    videoItag,
  ]);

  return null;
}
