"use client";

import { useState, useEffect, useId, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "zustand/react";
import { toast } from "sonner";
import { authStore } from "@/stores/auth-store";
import { conversationsApi } from "@/lib/api";
import { getConversationParticipant, getMessageSenderId } from "@/lib/messages";
import { useConversationSocket } from "@/hooks/use-conversation-socket";
import { ConversationHeader, MessageList, MessageComposer } from "@/components/messages";
import type { Conversation, Message } from "@/lib/api/types";

function participantName(participant?: {
  full_legal_name?: string;
  display_name?: string;
  business_name?: string;
  company_name?: string;
}) {
  return (
    participant?.full_legal_name ||
    participant?.display_name ||
    participant?.business_name ||
    participant?.company_name ||
    "them"
  );
}

export default function ProviderConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const currentUserId = useStore(authStore, (s) => s.user?._id);
  const sendInstanceId = useId();
  const sendCounterRef = useRef(0);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendText, setSendText] = useState("");
  const [sending, setSending] = useState(false);

  const { sendMessage: sendSocketMessage, markMessageRead } = useConversationSocket(
    conversationId,
    {
      onMessageNew: (msg) => {
        setMessages((prev) => {
          const byClientId = prev.findIndex((m) => m.client_message_id === msg.client_message_id);
          if (byClientId !== -1) {
            const next = [...prev];
            next[byClientId] = msg;
            return next;
          }
          const exists = prev.some((m) => m._id === msg._id);
          if (exists) return prev;
          return [...prev, msg];
        });
        if (getMessageSenderId(msg) !== currentUserId) {
          markMessageRead({ conversation_id: msg.conversation_id, message_id: msg._id });
        }
      },
      onMessageDelivered: (payload) => {
        setMessages((prev) =>
          prev.map((m) => (m._id === payload.message_id ? { ...m, status: "delivered" } : m)),
        );
      },
      onMessageRead: (payload) => {
        setMessages((prev) =>
          prev.map((m) => (m._id === payload.message_id ? { ...m, status: "read" } : m)),
        );
      },
    },
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;
    setLoading(true);

    Promise.all([
      conversationsApi.getConversation(conversationId),
      conversationsApi.getMessages(conversationId, { limit: 50 }),
    ])
      .then(([convData, msgsData]) => {
        if (cancelled) return;
        setConversation(convData);
        setMessages(msgsData);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!conversationId || !currentUserId || !conversation) return;
    const unread = conversation.unread_counts[currentUserId] || 0;
    if (unread > 0) {
      conversationsApi.markAllRead(conversationId).catch(() => {});
    }
  }, [conversationId, conversation, currentUserId]);

  async function handleSend() {
    if (!sendText.trim() || !conversation || sending) return;
    const content = sendText.trim();
    setSendText("");
    setSending(true);
    const clientId = (() => {
      sendCounterRef.current += 1;
      return `provider-${sendInstanceId}-${sendCounterRef.current}`;
    })();

    const optimistic: Message = {
      _id: clientId,
      conversation_id: conversation._id,
      sender_id: currentUserId ?? "",
      content,
      message_type: "text",
      attachments: [],
      client_message_id: clientId,
      status: "sending",
      read_by: [],
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);

    try {
      const sent = sendSocketMessage({
        conversation_id: conversation._id,
        content,
        client_message_id: clientId,
      });

      if (!sent) {
        const saved = await conversationsApi.sendMessage({
          conversation_id: conversation._id,
          content,
          client_message_id: clientId,
        });
        setMessages((prev) => prev.map((m) => (m.client_message_id === clientId ? saved : m)));
        return;
      }

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.client_message_id === clientId && m.status === "sending"
              ? { ...m, status: "failed" }
              : m,
          ),
        );
      }, 5000);
    } catch (err: unknown) {
      setMessages((prev) =>
        prev.map((m) => (m.client_message_id === clientId ? { ...m, status: "failed" } : m)),
      );
      setSendText(content);
      const msg =
        typeof err === "object" && err !== null && "backendMessage" in err
          ? String((err as { backendMessage: unknown }).backendMessage)
          : "Failed to send message.";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  }

  function handleMarkAllRead() {
    if (!conversation) return;
    conversationsApi
      .markAllRead(conversation._id)
      .then(() => toast.success("Marked all as read"))
      .catch(() => toast.error("Could not mark as read"));
  }

  const participant = getConversationParticipant(conversation, currentUserId);
  const name = participantName(participant);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      <div className="flex h-full flex-col overflow-hidden">
        <ConversationHeader
          participant={participant}
          loading={loading && !conversation}
          showBack
          onBack={() => router.push("/provider/messages")}
          onMarkAllRead={handleMarkAllRead}
        />
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          participant={participant}
          loading={loading}
        />
        <MessageComposer
          value={sendText}
          onChange={setSendText}
          onSend={handleSend}
          sending={sending}
          placeholder={`Message ${name.split(" ")[0]}...`}
        />
      </div>
    </div>
  );
}
