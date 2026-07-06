import { useQuery } from "@tanstack/react-query";
import { resolveSabrHttpSessionSrc } from "../lib/sabr-source";
import type { MediaSrc } from "../lib/vidstack";
import { useAuthStore } from "../stores/auth-store";
import type { VideoStream } from "../types/stream";

type SabrManifestSrc = {
  src: MediaSrc | null;
  loading: boolean;
};

export function useSabrManifestSrc(stream: VideoStream, enabled: boolean): SabrManifestSrc {
  const authScope = useAuthStore((state) => (state.token ? (state.me?.id ?? "auth") : "guest"));
  const query = useQuery({
    queryKey: ["sabr-manifest", stream.id, authScope],
    queryFn: () => resolveSabrHttpSessionSrc(stream),
    enabled,
    staleTime: 3 * 60 * 1000,
    retry: false,
  });
  return { src: query.data ?? null, loading: enabled && query.isLoading };
}
