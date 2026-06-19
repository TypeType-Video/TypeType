import { create } from "zustand";
import { persist } from "zustand/middleware";

type UiStore = {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  toggleSidebar: () => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
};

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      openMobileSidebar: () => set({ mobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
      toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
    }),
    {
      name: "typed-ui",
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);
