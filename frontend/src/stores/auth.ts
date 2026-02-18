import { create } from 'zustand';
import { api } from '@/lib/api';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'COACH' | 'ADMIN';
  isPremium: boolean;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (email, password) => {
    const result = await api.post('/auth/login', { email, password });
    set({ user: result.user });
  },

  logout: async () => {
    await api.post('/auth/logout');
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const result = await api.get('/auth/me');
      set({ user: result.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
