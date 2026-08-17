"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "zustand/react";
import { toast } from "sonner";
import { authStore } from "@/stores/auth-store";
import { conversationsApi } from "@/lib/api";
import { ConversationHeader, MessageList, MessageComposer } from "@/components/messages";
import type { Conversation, Message } from "@/lib/api/types";

export default function TalentConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const currentUserId = useStore(authStore, (s) => s.user?._id);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendText, setSendText] = useState("");
  const [sending, setSending] = useState(false);

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
    const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      const msg = await conversationsApi.sendMessage({
        conversation_id: conversation._id,
        content,
        client_message_id: clientId,
      });
      setMessages((prev) => [...prev, msg]);
    } catch {
      setSendText(content);
      toast.error("Failed to send message.");
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

  const participant = conversation?.participant;
  const name = participant?.full_legal_name || participant?.company_name || "Unknown";

  return (
    <div className="fixed inset-x-0 top-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 flex flex-col bg-background lg:bottom-0">
      <div className="flex h-full flex-col overflow-hidden">
        <ConversationHeader
          participant={participant}
          loading={loading && !conversation}
          showBack
          onBack={() => router.push("/talent/messages")}
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
          placeholder={`Message ${name.split(" ")[0] || "them"}...`}
        />
      </div>
    </div>
  );
}
