/**
 * Blueberry Math Analyzer 3.0 - Authentication Store
 * Uses Zustand for state management
 *
 * SECURITY NOTES:
 * - Token is stored ONLY in memory (not localStorage)
 * - This is intentional to prevent credential persistence
 * - User must re-login after page refresh
 * - NO passwords are ever stored
 */

import { create } from 'zustand';
import type { AuthCredentials } from '@/types/blueberry';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  cookies: string | null;
  userName: string | null;
  setAuth: (credentials: AuthCredentials, userName?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  cookies: null,
  userName: null,

  setAuth: (credentials, userName = null) =>
    set({
      isAuthenticated: true,
      token: credentials.token,
      cookies: credentials.cookies || null,
      userName: userName
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      token: null,
      cookies: null,
      userName: null
    })
}));
