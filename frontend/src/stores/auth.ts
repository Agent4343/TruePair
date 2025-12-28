import { create } from 'zustand';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  onboardingCompleted: boolean;
  status: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const { user } = await api.login(email, password);
    set({ user, isAuthenticated: true });
  },

  register: async (email: string, password: string) => {
    const { user } = await api.register(email, password);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    api.logout();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      if (!api.getToken()) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }
      const user = await api.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      api.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
}));
