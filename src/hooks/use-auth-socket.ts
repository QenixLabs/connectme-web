"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/providers/socket-provider";

export function useAuthSocket() {
  const socket = useSocket();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      setConnected(false);
      return;
    }

    setConnected(socket.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  return { socket, connected };
}
