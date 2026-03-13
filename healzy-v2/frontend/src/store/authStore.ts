import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens } from '@/types/user';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (tokens) => set({ tokens }),
      setLoading: (isLoading) => set({ isLoading }),
      login: (user, tokens) => set({ user, tokens, isAuthenticated: true }),
      logout: () => set({ user: null, tokens: null, isAuthenticated: false }),
      updateUser: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
      })),
    }),
    {
      name: 'healzy-auth',
      partialize: (state) => ({ user: state.user, tokens: state.tokens, isAuthenticated: state.isAuthenticated }),
    }
  )
);
