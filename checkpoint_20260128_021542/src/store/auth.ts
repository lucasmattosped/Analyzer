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

export interface BlueberrySchool {
  guid?: string;
  name: string;
}

export interface BlueberryCredentials {
  token: string | null;
  cookies: string | null;
  school: BlueberrySchool | null;
}

interface AuthState {
  isAuthenticated: boolean;
  credentials: BlueberryCredentials;
  userName: string | null;
  setAuth: (credentials: BlueberryCredentials, userName?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  credentials: {
    token: null,
    cookies: null,
    school: null
  },
  userName: null,

  setAuth: (credentials, userName = null) =>
    set({
      isAuthenticated: true,
      credentials,
      userName
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      credentials: {
        token: null,
        cookies: null,
        school: null
      },
      userName: null
    })
}));
