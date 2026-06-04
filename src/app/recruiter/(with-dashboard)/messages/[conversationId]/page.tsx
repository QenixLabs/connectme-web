"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChatHero } from "@/components/messaging/chat-hero";
import { MessageThread } from "@/components/messaging/message-thread";
import { MessageInput } from "@/components/messaging/message-input";
import {
  getOtherParticipant,
  getOtherParticipantId,
  getDisplayName,
  generateClientId,
} from "@/components/messaging/utils";
import { messagesApi, type Message, type Conversation } from "@/lib/api/messages";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/providers/auth-store-provider";
import { useSocket } from "@/hooks/use-socket";

export default function RecruiterChatPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const conversationId = params.conversationId as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedByMe, setBlockedByMe] = useState(false);

  const currentUserId = user?._id || "";
  const selectedConversationIdRef = useRef(conversationId);
  useEffect(() => {
    selectedConversationIdRef.current = conversationId;
  }, [conversationId]);

  // Load conversation details
  useEffect(() => {
    if (!conversationId) return;
    const load = async () => {
      setLoadingConversation(true);
      try {
        const conv = await messagesApi.getConversation(conversationId);
        setConversation(conv);
      } catch {
        setConversation(null);
      } finally {
        setLoadingConversation(false);
      }
    };
    load();
  }, [conversationId]);

  // Load messages
  useEffect(() => {
    if (!conversationId || !currentUserId) return;
    const load = async () => {
      setLoadingMessages(true);
      setMessages([]);
      try {
        const data = await messagesApi.getMessages(conversationId);
        const ordered = data.reverse();
        setMessages(ordered);

        const unreadFromOthers = ordered.filter(
          (m) =>
            String(m.sender_id._id) !== currentUserId &&
            !m.read_by?.includes(currentUserId),
        );
        if (unreadFromOthers.length > 0) {
          try {
            const result = await messagesApi.markAllAsRead(conversationId);
            queryClient.invalidateQueries({
              queryKey: queryKeys.messages.unreadCount(),
            });
            for (const msgId of result.message_ids) {
              socket?.emit("message:read", {
                conversation_id: conversationId,
                message_id: msgId,
              });
            }
          } catch {
            // silently fail
          }
        }
      } finally {
        setLoadingMessages(false);
      }
    };
    load();

    socket?.emit("conversation:join", { conversation_id: conversationId });
    return () => {
      socket?.emit("conversation:leave", { conversation_id: conversationId });
    };
  }, [conversationId, socket, currentUserId, queryClient]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      if (message.conversation_id !== selectedConversationIdRef.current) return;
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
      if (message.sender_id._id !== currentUserId) {
        messagesApi.markAsRead(message.conversation_id, message._id);
        socket.emit("message:read", {
          conversation_id: message.conversation_id,
          message_id: message._id,
        });
      }
    };

    const handleReadReceipt = (data: {
      message_id: string;
      conversation_id: string;
      user_id: string;
    }) => {
      if (data.conversation_id !== selectedConversationIdRef.current) return;
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.message_id
            ? {
                ...m,
                read_by: Array.from(
                  new Set([...(m.read_by || []), data.user_id]),
                ),
              }
            : m,
        ),
      );
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:read_receipt", handleReadReceipt);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:read_receipt", handleReadReceipt);
    };
  }, [socket, currentUserId]);

  // Block check
  useEffect(() => {
    const otherId = conversation
      ? getOtherParticipantId(conversation, currentUserId)
      : "";
    if (!otherId) return;
    const check = async () => {
      try {
        const res = await messagesApi.checkBlocked(otherId);
        setIsBlocked(res.isBlocked);
        setBlockedByMe(res.blockedByMe);
      } catch {
        setIsBlocked(false);
        setBlockedByMe(false);
      }
    };
    check();
  }, [conversation, currentUserId]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || !conversationId || isBlocked || !currentUserId)
      return;

    const content = inputValue.trim();
    const clientMessageId = generateClientId();
    setInputValue("");

    const optimisticMessage: Message = {
      _id: clientMessageId,
      conversation_id: conversationId,
      sender_id: { _id: currentUserId, email: "" },
      content,
      message_type: "text",
      status: "sending",
      read_by: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const sent = await messagesApi.sendMessage(
        conversationId,
        content,
        clientMessageId,
      );
      setMessages((prev) => {
        if (prev.some((m) => m._id === sent._id)) {
          return prev.filter((m) => m._id !== clientMessageId);
        }
        return prev.map((m) => (m._id === clientMessageId ? sent : m));
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === clientMessageId ? { ...m, status: "failed" } : m,
        ),
      );
    }
  }, [inputValue, conversationId, currentUserId, isBlocked]);

  if (!hasHydrated || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-msg-ink-muted">Loading...</p>
      </div>
    );
  }

  const otherParticipant = conversation
    ? getOtherParticipant(conversation, currentUserId)
    : null;
  const otherId = conversation
    ? getOtherParticipantId(conversation, currentUserId)
    : "";
  const otherName = getDisplayName(otherParticipant, otherId);

  return (
    <div className="flex flex-col h-full">
      <ChatHero
        otherUser={otherParticipant}
        otherName={otherName}
        otherId={otherId}
        conversationId={conversationId}
        onBack={() => router.push("/recruiter/messages")}
        onBlocked={() => {
          setIsBlocked(true);
          setBlockedByMe(true);
        }}
      />
      <MessageThread
        messages={messages}
        currentUserId={currentUserId}
        loading={loadingMessages || loadingConversation}
      />
      <MessageInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        isBlocked={isBlocked}
        blockedByMe={blockedByMe}
      />
    </div>
  );
}
