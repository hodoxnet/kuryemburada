import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  role: 'SUPER_ADMIN' | 'COMPANY' | 'COURIER';
  status?: string;
  company?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  courier?: {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    vehicleType: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setAuth: (user: User) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (user) => {
    set({
      user,
      isAuthenticated: true,
    });
  },

  clearAuth: () => {
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));