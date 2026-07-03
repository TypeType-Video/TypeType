import { create } from "zustand";
import type { SabrQualityOption } from "../types/sabr";

type SabrQualityState = {
  activeSourceId: string | null;
  qualities: Record<string, SabrQualityOption[]>;
  selected: Record<string, number>;
  setActiveSource: (id: string, qualities: SabrQualityOption[], selectedItag: number) => void;
  clearActiveSource: (id: string) => void;
  selectQuality: (id: string, itag: number) => void;
};

export const useSabrQualityStore = create<SabrQualityState>((set) => ({
  activeSourceId: null,
  qualities: {},
  selected: {},
  setActiveSource: (id, qualities, selectedItag) =>
    set((state) => ({
      activeSourceId: id,
      qualities: { ...state.qualities, [id]: qualities },
      selected: { ...state.selected, [id]: state.selected[id] ?? selectedItag },
    })),
  clearActiveSource: (id) =>
    set((state) => ({
      activeSourceId: state.activeSourceId === id ? null : state.activeSourceId,
    })),
  selectQuality: (id, itag) =>
    set((state) => ({
      selected: { ...state.selected, [id]: itag },
    })),
}));
