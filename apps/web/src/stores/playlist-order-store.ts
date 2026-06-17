import { create } from "zustand";

type PlaylistOrderState = {
  orders: Record<string, string[]>;
  setOrder: (listId: string, order: string[]) => void;
};

export const usePlaylistOrderStore = create<PlaylistOrderState>((set) => ({
  orders: {},
  setOrder: (listId, order) => set((state) => ({ orders: { ...state.orders, [listId]: order } })),
}));
