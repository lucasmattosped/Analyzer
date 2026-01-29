/**
 * Blueberry Math Analyzer 3.0 - Authentication Store
 * Uses Zustand for state management
 *
 * SECURITY NOTES:
 * - Token is stored ONLY in memory (not localStorage)
 * - This is intentional to prevent credential persistence
 * - User must re-login after page refresh
 * - NO passwords are ever stored
 * - All headers from Blueberry Math API are stored for subsequent requests
 */

import { create } from 'zustand';

export interface BlueberryCredentials {
  token: string | null;
  cookies: string | null;
  userAgent: string | null;
  baggage: string | null;
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
    userAgent: null,
    baggage: null
  },
  userName: null,

  setAuth: (credentials, userName = null) =>
    set({
      isAuthenticated: true,
      credentials: credentials,
      userName: userName
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      credentials: {
        token: null,
        cookies: null,
        userAgent: null,
        baggage: null
      },
      userName: null
    })
}));
