import { create } from 'zustand';
import { login as loginApi, logout as logoutApi } from '../services/api/auth.api';

const STORAGE_KEY = 'fh_auth_token';

export const useAuthStore = create((set) => ({
  user: null,
  token: sessionStorage.getItem(STORAGE_KEY) || null,
  isAuthenticated: !!sessionStorage.getItem(STORAGE_KEY),
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await loginApi(credentials);
      sessionStorage.setItem(STORAGE_KEY, token);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await logoutApi();
    sessionStorage.removeItem(STORAGE_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
