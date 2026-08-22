"use client";

import { createContext, useContext, ReactNode, useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/providers/auth-store-provider";
import { tokenStorage } from "@/lib/token-storage";
import { authStore } from "@/stores/auth-store";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      setSocket(null);
      return;
    }

    const token = tokenStorage.getToken();
    if (!token) {
      setSocket(null);
      return;
    }

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    const unsubscribe = tokenStorage.subscribe((latest) => {
      if (!latest || !socketRef.current) return;

      const currentAuth = socketRef.current.auth as { token?: string } | undefined;
      if (currentAuth?.token === latest) return;

      socketRef.current.auth = { token: latest };
      socketRef.current.disconnect().connect();

      if (authStore.getState().accessToken !== latest) {
        authStore.getState().setAccessToken(latest);
      }
    });

    return () => {
      unsubscribe();
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
