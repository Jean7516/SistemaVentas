import { create } from 'zustand';

interface UiStore {
  sidebarColapsado: boolean;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiStore>()((set) => ({
  sidebarColapsado: false,
  toggleSidebar: () => set((state) => ({ sidebarColapsado: !state.sidebarColapsado })),
}));
