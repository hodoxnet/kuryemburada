import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../api/client';

export interface User {
  id: number;
  email: string;
  role: 'SUPER_ADMIN' | 'COMPANY' | 'COURIER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; role: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.login(email, password);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Login failed',
          });
          throw error;
        }
      },

      register: async (data: { email: string; password: string; role: string }) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.register(data);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Registration failed',
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await apiClient.logout();
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      checkAuth: () => {
        const isAuthenticated = apiClient.isAuthenticated();
        if (!isAuthenticated) {
          set({
            user: null,
            isAuthenticated: false,
          });
        } else {
          const currentUser = get().user;
          if (currentUser) {
            set({ isAuthenticated: true });
          }
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);