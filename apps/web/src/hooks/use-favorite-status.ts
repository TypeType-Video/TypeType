import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { addFavorite, fetchFavorite, removeFavorite } from "../lib/api-collections";
import type { FavoriteItem } from "../types/user";
import { useAuth } from "./use-auth";

const FAVORITES_KEY = ["favorites"] as const;

export function useFavoriteStatus(videoUrl: string) {
  const { authReady, isAuthed } = useAuth();
  const queryClient = useQueryClient();
  const [intent, setIntent] = useState<boolean | null>(null);
  const queryKey = [...FAVORITES_KEY, videoUrl] as const;
  const query = useQuery({
    queryKey,
    queryFn: () => fetchFavorite(videoUrl),
    enabled: authReady && isAuthed,
  });
  const isFavorite = intent ?? (query.data !== null && query.data !== undefined);

  async function add(): Promise<void> {
    if (isFavorite) return;
    setIntent(true);
    try {
      const favorite = await addFavorite(videoUrl);
      queryClient.setQueryData<FavoriteItem | null>(queryKey, favorite);
      await queryClient.invalidateQueries({
        queryKey: FAVORITES_KEY,
        exact: true,
        refetchType: "none",
      });
    } catch (error) {
      setIntent(null);
      throw error;
    }
    setIntent(null);
  }

  async function remove(): Promise<void> {
    setIntent(false);
    try {
      await removeFavorite(videoUrl);
      queryClient.setQueryData<FavoriteItem | null>(queryKey, null);
      await queryClient.invalidateQueries({
        queryKey: FAVORITES_KEY,
        exact: true,
        refetchType: "none",
      });
    } catch (error) {
      setIntent(null);
      throw error;
    }
    setIntent(null);
  }

  return {
    isFavorite,
    add,
    remove,
    isPending: (authReady && isAuthed && query.isPending) || intent !== null,
  };
}
