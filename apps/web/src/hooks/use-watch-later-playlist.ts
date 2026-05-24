import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { addWatchLater, fetchWatchLater, removeWatchLater } from "../lib/api-collections";
import { useAuth } from "./use-auth";

const KEY = ["watch-later"];

type AddPayload = {
  url: string;
  title: string;
  thumbnail: string;
  duration: number;
};

type Intent = { url: string; adding: boolean };

export function useWatchLaterPlaylist() {
  const { authReady, isAuthed } = useAuth();
  const intentRef = useRef<Intent | null>(null);
  const [intent, setIntent] = useState<Intent | null>(null);
  const query = useQuery({
    queryKey: KEY,
    queryFn: fetchWatchLater,
    enabled: authReady && isAuthed,
  });

  function isInWatchLater(videoUrl: string): boolean {
    if (intentRef.current?.url === videoUrl) return intentRef.current.adding;
    return query.data?.some((item) => item.url === videoUrl) ?? false;
  }

  function applyIntent(value: Intent | null) {
    intentRef.current = value;
    setIntent(value);
  }

  async function add(payload: AddPayload): Promise<void> {
    if (isInWatchLater(payload.url)) return;
    applyIntent({ url: payload.url, adding: true });
    try {
      await addWatchLater(payload);
      await query.refetch();
    } catch (e) {
      applyIntent(null);
      throw e;
    }
    applyIntent(null);
  }

  async function remove(videoUrl: string): Promise<void> {
    applyIntent({ url: videoUrl, adding: false });
    try {
      await removeWatchLater(videoUrl);
      await query.refetch();
    } catch (e) {
      applyIntent(null);
      throw e;
    }
    applyIntent(null);
  }

  return { isInWatchLater, add, remove, isPending: intent !== null };
}
