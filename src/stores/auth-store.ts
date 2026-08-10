import { createStore } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";
import { authApi } from "@/lib/api";
import { tokenStorage } from "@/lib/token-storage";

export interface User {
  _id: string;
  username?: string;
  email: string;
  phone: string;
  role: "talent" | "recruiter" | "admin";
  is_email_verified: boolean;
  is_phone_verified: boolean;
  verification_tier: number;
  trust_score: number;
  status: string;
  active_plan?: string;
  subscription_status?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setAccessToken: (token: string | null) => void;
  clearError: () => void;
  setHasHydrated: (v: boolean) => void;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "Secure;" : "";
  document.cookie = `${name}=${value};expires=${expires};path=/;SameSite=Strict;${secure}`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

export const authStore = createStore<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasHydrated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { access_token } = await authApi.login(email, password);
          tokenStorage.setToken(access_token);
          set({ accessToken: access_token });
          const { user } = await authApi.getCurrentUser();
          setCookie("auth_session", "1", 7);
          setCookie("user_role", user.role, 7);
          set({ user, accessToken: access_token, isAuthenticated: true, isLoading: false });
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          const message = err.response?.data?.message || "Login failed";
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {}
        deleteCookie("auth_session");
        deleteCookie("user_role");
        tokenStorage.setToken(null);
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const { user } = await authApi.getCurrentUser();
          setCookie("auth_session", "1", 7);
          setCookie("user_role", user.role, 7);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          deleteCookie("auth_session");
          deleteCookie("user_role");
          tokenStorage.setToken(null);
          set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
        }
      },

      setAccessToken: (token: string | null) => {
        tokenStorage.setToken(token);
        set({ accessToken: token });
      },
      clearError: () => set({ error: null }),
      setHasHydrated: (v: boolean) => set({ hasHydrated: v }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated?.(true);
        if (state?.accessToken) {
          tokenStorage.setToken(state.accessToken);
        }
      },
    },
  ),
);
