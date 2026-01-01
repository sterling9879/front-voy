import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@shared/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

// Default user - no login required
const defaultUser: User = {
  id: 'default-user',
  email: 'usuario@voyra.com',
  name: 'Usuário Voyra',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: defaultUser,
      token: 'no-auth-required',
      isAuthenticated: true,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: defaultUser, token: 'no-auth-required', isAuthenticated: true }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
