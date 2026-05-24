import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { addFavorite, fetchFavorites, removeFavorite } from "../lib/api-collections";
import { useAuth } from "./use-auth";

const KEY = ["favorites"];

type AddPayload = {
  url: string;
  title: string;
  thumbnail: string;
  duration: number;
};

type Intent = { url: string; adding: boolean };

export function useFavoritesPlaylist() {
  const { authReady, isAuthed } = useAuth();
  const intentRef = useRef<Intent | null>(null);
  const [intent, setIntent] = useState<Intent | null>(null);
  const query = useQuery({
    queryKey: KEY,
    queryFn: fetchFavorites,
    enabled: authReady && isAuthed,
  });

  function isInFavorites(videoUrl: string): boolean {
    if (intentRef.current?.url === videoUrl) return intentRef.current.adding;
    return query.data?.some((item) => item.videoUrl === videoUrl) ?? false;
  }

  function applyIntent(value: Intent | null) {
    intentRef.current = value;
    setIntent(value);
  }

  async function add(payload: AddPayload): Promise<void> {
    if (isInFavorites(payload.url)) return;
    applyIntent({ url: payload.url, adding: true });
    try {
      await addFavorite(payload.url);
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
      await removeFavorite(videoUrl);
      await query.refetch();
    } catch (e) {
      applyIntent(null);
      throw e;
    }
    applyIntent(null);
  }

  return { isInFavorites, add, remove, isPending: intent !== null };
}
