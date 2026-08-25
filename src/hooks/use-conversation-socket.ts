"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuthSocket } from "@/hooks/use-auth-socket";
import type { Message } from "@/lib/api/types";

export interface ConversationSocketHandlers {
  onMessageNew?: (message: Message) => void;
  onMessageDelivered?: (payload: { message_id: string; conversation_id: string }) => void;
  onMessageRead?: (payload: { message_id: string; conversation_id: string; user_id: string }) => void;
}

export function useConversationSocket(
  conversationId: string | null,
  handlers: ConversationSocketHandlers,
) {
  const { socket, connected } = useAuthSocket();
  const handlersRef = useRef(handlers);
  const socketRef = useRef(socket);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    if (!socket || !connected || !conversationId) return;

    socket.emit("conversation:join", { conversation_id: conversationId });

    const onMessageNew = (message: Message) => {
      handlersRef.current.onMessageNew?.(message);
    };
    const onMessageDelivered = (payload: {
      message_id: string;
      conversation_id: string;
    }) => {
      handlersRef.current.onMessageDelivered?.(payload);
    };
    const onMessageRead = (payload: {
      message_id: string;
      conversation_id: string;
      user_id: string;
    }) => {
      handlersRef.current.onMessageRead?.(payload);
    };

    socket.on("message:new", onMessageNew);
    socket.on("message:delivered", onMessageDelivered);
    socket.on("message:read_receipt", onMessageRead);

    return () => {
      socket.emit("conversation:leave", { conversation_id: conversationId });
      socket.off("message:new", onMessageNew);
      socket.off("message:delivered", onMessageDelivered);
      socket.off("message:read_receipt", onMessageRead);
    };
  }, [socket, connected, conversationId]);

  const sendMessage = useCallback(
    (payload: {
      conversation_id: string;
      content: string;
      client_message_id: string;
    }) => {
      const s = socketRef.current;
      if (!s) {
        console.warn("[conversation-socket] sendMessage called but socket is null");
        return false;
      }
      if (!s.connected) {
        console.warn("[conversation-socket] sendMessage called but socket is not connected");
        return false;
      }
      s.emit("message:send", payload);
      return true;
    },
    [],
  );

  const markMessageRead = useCallback(
    (payload: { conversation_id: string; message_id: string }) => {
      socketRef.current?.emit("message:read", payload);
    },
    [],
  );

  return { sendMessage, markMessageRead, connected };
}
