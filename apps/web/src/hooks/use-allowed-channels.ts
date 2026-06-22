import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { allowChannel, disallowChannel, fetchAllowedChannels } from "../lib/api-collections";
import { useAuth } from "./use-auth";

const ALLOWED_CHANNELS_KEY = ["allowed-channels"];

type AllowChannelArgs = {
  url: string;
  name?: string | null;
  thumbnailUrl?: string | null;
  global?: boolean;
};

export function useAllowedChannels() {
  const qc = useQueryClient();
  const { authReady, isAuthed } = useAuth();
  const query = useQuery({
    queryKey: ALLOWED_CHANNELS_KEY,
    queryFn: fetchAllowedChannels,
    enabled: authReady && isAuthed,
    staleTime: 5 * 60 * 1000,
  });
  const add = useMutation({
    mutationFn: ({ url, name, thumbnailUrl, global }: AllowChannelArgs) =>
      isAuthed ? allowChannel(url, name, thumbnailUrl, global) : Promise.resolve(null),
    onSuccess: () => qc.invalidateQueries({ queryKey: ALLOWED_CHANNELS_KEY }),
  });
  const remove = useMutation({
    mutationFn: (url: string) => (isAuthed ? disallowChannel(url) : Promise.resolve()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ALLOWED_CHANNELS_KEY }),
  });
  return { query, add, remove };
}
