import { create } from "zustand";

const tokenKey = "cms_token";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem(tokenKey),
  setAuth: ({ user, token }) => {
    localStorage.setItem(tokenKey, token);
    set({ user, token });
  },
  setUser: (user) => set({ user }),
  clearAuth: () => {
    localStorage.removeItem(tokenKey);
    set({ user: null, token: null });
  }
}));

