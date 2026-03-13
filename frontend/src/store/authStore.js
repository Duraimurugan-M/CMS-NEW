import { create } from "zustand";

const tokenKey = "cms_token";
const refreshTokenKey = "cms_refresh_token";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem(tokenKey),
  refreshToken: localStorage.getItem(refreshTokenKey),
  setAuth: ({ user, token, refreshToken }) => {
    localStorage.setItem(tokenKey, token);
    if (refreshToken) localStorage.setItem(refreshTokenKey, refreshToken);
    set({ user, token, refreshToken: refreshToken || null });
  },
  setToken: ({ token, refreshToken }) => {
    localStorage.setItem(tokenKey, token);
    if (refreshToken) localStorage.setItem(refreshTokenKey, refreshToken);
    set((state) => ({ ...state, token, refreshToken: refreshToken || state.refreshToken }));
  },
  setUser: (user) => set({ user }),
  clearAuth: () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(refreshTokenKey);
    set({ user: null, token: null, refreshToken: null });
  }
}));

