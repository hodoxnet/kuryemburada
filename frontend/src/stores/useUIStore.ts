import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Modals
  modals: {
    [key: string]: boolean;
  };
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
  
  setGlobalLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    immer((set) => ({
      // Initial State
      sidebarOpen: true,
      sidebarCollapsed: false,
      theme: 'system',
      modals: {},
      globalLoading: false,
      loadingMessage: null,

      // Sidebar Actions
      toggleSidebar: () =>
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),

      setSidebarOpen: (open) =>
        set((state) => {
          state.sidebarOpen = open;
        }),

      toggleSidebarCollapse: () =>
        set((state) => {
          state.sidebarCollapsed = !state.sidebarCollapsed;
        }),

      setSidebarCollapsed: (collapsed) =>
        set((state) => {
          state.sidebarCollapsed = collapsed;
        }),

      // Theme Actions
      setTheme: (theme) =>
        set((state) => {
          state.theme = theme;
          
          // Apply theme to document
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else if (theme === 'light') {
            document.documentElement.classList.remove('dark');
          } else {
            // System theme
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        }),

      // Modal Actions
      openModal: (modalId) =>
        set((state) => {
          state.modals[modalId] = true;
        }),

      closeModal: (modalId) =>
        set((state) => {
          state.modals[modalId] = false;
        }),

      toggleModal: (modalId) =>
        set((state) => {
          state.modals[modalId] = !state.modals[modalId];
        }),

      // Loading Actions
      setGlobalLoading: (loading, message = null) =>
        set((state) => {
          state.globalLoading = loading;
          state.loadingMessage = message;
        }),
    })),
    {
      name: 'ui-store',
    }
  )
);