"use client";

import { createContext, useContext, useRef, ReactNode } from "react";
import { useStore } from "zustand/react";
import { authStore, AuthState } from "@/stores/auth-store";

const AuthStoreContext = createContext<typeof authStore | null>(null);

export function AuthStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef(authStore);
  return (
    <AuthStoreContext.Provider value={storeRef.current}>
      {children}
    </AuthStoreContext.Provider>
  );
}

export function useAuthStore<T = AuthState>(
  selector?: (state: AuthState) => T,
): T {
  const store = useContext(AuthStoreContext);
  if (!store) {
    throw new Error("Missing AuthStoreProvider in tree");
  }
  return useStore(store, selector || ((state) => state as T));
}
