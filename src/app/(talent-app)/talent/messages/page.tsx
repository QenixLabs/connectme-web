"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "zustand/react";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { authStore } from "@/stores/auth-store";
import { conversationsApi } from "@/lib/api";
import { getConversationParticipant, getMessageSenderId } from "@/lib/messages";
import { useConversationSocket } from "@/hooks/use-conversation-socket";
import { ConversationList, ConversationHeader, MessageList, MessageComposer, EmptyState } from "@/components/messages";
import type { Conversation, Message } from "@/lib/api/types";

const PAGE_SIZE = 20;
type Filter = "All" | "Unread" | "Pinned";

export default function TalentMessagesPage() {
  const router = useRouter();
  const currentUserId = useStore(authStore, (s) => s.user?._id);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendText, setSendText] = useState("");
  const [sending, setSending] = useState(false);

  const { sendMessage: sendSocketMessage, markMessageRead } = useConversationSocket(
    activeId,
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
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c._id === msg.conversation_id);
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            last_message_preview: typeof msg.content === "string" ? msg.content : "",
            last_message_sender_id: getMessageSenderId(msg) ?? null,
            last_message_at: msg.created_at,
            last_message_status: msg.status,
          };
          return [next[idx], ...next.slice(0, idx), ...next.slice(idx + 1)];
        });
        if (getMessageSenderId(msg) !== currentUserId) {
          markMessageRead({ conversation_id: msg.conversation_id, message_id: msg._id });
        }
      },
      onMessageDelivered: (payload) => {
        setMessages((prev) =>
          prev.map((m) => (m._id === payload.message_id ? { ...m, status: "delivered" } : m))
        );
        setConversations((prev) =>
          prev.map((c) =>
            c._id === payload.conversation_id
              ? { ...c, last_message_status: "delivered" }
              : c
          )
        );
      },
      onMessageRead: (payload) => {
        setMessages((prev) =>
          prev.map((m) => (m._id === payload.message_id ? { ...m, status: "read" } : m))
        );
        setConversations((prev) =>
          prev.map((c) =>
            c._id === payload.conversation_id
              ? { ...c, last_message_status: "read" }
              : c
          )
        );
      },
    }
  );

  const lastRowRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchConversations = useCallback(async (nextCursor?: string) => {
    if (nextCursor) setLoadingMore(true);
    else setLoading(true);

    try {
      const data = await conversationsApi.getConversations({ cursor: nextCursor, limit: PAGE_SIZE });
      const items = Array.isArray(data) ? data : [];
      setConversations((prev) => (nextCursor ? [...prev, ...items] : items));
      setHasMore(items.length === PAGE_SIZE);
      if (items.length > 0) setCursor(items[items.length - 1]?._id);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore && cursor) {
          fetchConversations(cursor);
        }
      },
      { threshold: 0.1 }
    );
    if (lastRowRef.current) observerRef.current.observe(lastRowRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, cursor, fetchConversations]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setMessagesLoading(true);
    conversationsApi
      .getMessages(activeId, { limit: 50 })
      .then((data) => {
        if (!cancelled) setMessages(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!activeId || !currentUserId) return;
    const conversation = conversations.find((c) => c._id === activeId);
    if (!conversation) return;
    const unread = conversation.unread_counts[currentUserId] || 0;
    if (unread > 0) {
      conversationsApi.markAllRead(activeId).then(() => {
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeId
              ? { ...c, unread_counts: { ...c.unread_counts, [currentUserId]: 0 } }
              : c
          )
        );
      }).catch(() => {});
    }
  }, [activeId, conversations, currentUserId]);

  const safeConversations = Array.isArray(conversations) ? conversations : [];
  const filtered = safeConversations
    .filter((c) => {
      if (filter === "Unread") return (c.unread_counts[currentUserId || ""] || 0) > 0;
      if (filter === "Pinned") return c.user_settings?.[currentUserId || ""]?.pinned;
      return true;
    })
    .filter((c) => {
      if (!query) return true;
      const p = getConversationParticipant(c, currentUserId);
      const name = (p?.full_legal_name || p?.company_name || "").toLowerCase();
      const profession = (p?.professions?.[0] || "").toLowerCase();
      const q = query.toLowerCase();
      return name.includes(q) || profession.includes(q);
    });

  const active = safeConversations.find((c) => c._id === activeId) || null;
  const activeParticipant = getConversationParticipant(active, currentUserId);
  const unreadTotal = safeConversations.reduce(
    (sum, c) => sum + (c.unread_counts[currentUserId || ""] || 0),
    0
  );

  function handleSelect(id: string) {
    setActiveId(id);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      router.push(`/talent/messages/${id}`);
    }
  }

  function handleConversationCreated(conversation: Conversation) {
    setConversations((prev) => {
      const exists = prev.some((c) => c._id === conversation._id);
      return exists ? prev : [conversation, ...prev];
    });
  }

  async function handleSend() {
    if (!sendText.trim() || !active || sending) return;
    const content = sendText.trim();
    setSendText("");
    setSending(true);
    const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const optimistic: Message = {
      _id: clientId,
      conversation_id: active._id,
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
        conversation_id: active._id,
        content,
        client_message_id: clientId,
      });

      if (!sent) {
        const saved = await conversationsApi.sendMessage({
          conversation_id: active._id,
          content,
          client_message_id: clientId,
        });
        setMessages((prev) =>
          prev.map((m) => (m.client_message_id === clientId ? saved : m))
        );
        return;
      }

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.client_message_id === clientId && m.status === "sending"
              ? { ...m, status: "failed" }
              : m
          )
        );
      }, 5000);
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.client_message_id === clientId ? { ...m, status: "failed" } : m
        )
      );
      setSendText(content);
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  function handleMarkAllRead() {
    if (!active) return;
    conversationsApi
      .markAllRead(active._id)
      .then(() => {
        setConversations((prev) =>
          prev.map((c) =>
            c._id === active._id
              ? { ...c, unread_counts: { ...c.unread_counts, [currentUserId || ""]: 0 } }
              : c
          )
        );
        toast.success("Marked all as read");
      })
      .catch(() => toast.error("Could not mark as read"));
  }

  return (
    <div className="fixed inset-x-0 top-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 flex flex-col bg-background lg:bottom-0">
      <div className="flex h-full flex-col lg:grid lg:grid-cols-[380px_1fr] lg:gap-0">
        <ConversationList
          conversations={filtered}
          activeId={activeId}
          currentUserId={currentUserId || ""}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          lastRef={(node) => {
            lastRowRef.current = node;
          }}
          filter={filter}
          onFilterChange={setFilter}
          query={query}
          onQueryChange={setQuery}
          onSelect={handleSelect}
          onConversationCreated={handleConversationCreated}
          unreadTotal={unreadTotal}
          className="h-full lg:border-r lg:border-border/60"
        />

        <section className="hidden h-full flex-col overflow-hidden bg-background lg:flex">
          {active ? (
            <>
              <ConversationHeader
                participant={activeParticipant}
                onMarkAllRead={handleMarkAllRead}
              />
              <MessageList
                messages={messages}
                currentUserId={currentUserId}
                participant={activeParticipant}
                loading={messagesLoading}
              />
              <MessageComposer
                value={sendText}
                onChange={setSendText}
                onSend={handleSend}
                sending={sending}
                placeholder={`Message ${activeParticipant?.full_legal_name?.split(" ")[0] || "them"}...`}
              />
            </>
          ) : (
            <EmptyState
              icon={MessageSquarePlus}
              title="Select a conversation"
              description="Choose a chat from the list to view messages and reply."
            />
          )}
        </section>
      </div>
    </div>
  );
}
