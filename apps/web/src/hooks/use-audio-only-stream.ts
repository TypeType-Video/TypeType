import { useQuery } from "@tanstack/react-query";
import { fetchAudioOnlyStream } from "../lib/api-audio-only";
import { useAuthStore } from "../stores/auth-store";

export function useAudioOnlyStream(
  url: string,
  preferOriginal: boolean,
  preferredLocale: string,
  enabled: boolean,
) {
  const authScope = useAuthStore((state) => (state.token ? (state.me?.id ?? "auth") : "guest"));
  return useQuery({
    queryKey: ["audio-only", url, preferOriginal, preferredLocale, authScope],
    queryFn: () => fetchAudioOnlyStream(url, preferOriginal, preferredLocale),
    enabled: enabled && url.trim().length > 0,
    staleTime: 3 * 60 * 1000,
    retry: false,
  });
}
