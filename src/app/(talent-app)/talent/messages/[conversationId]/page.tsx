"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "zustand/react";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCheck,
  MoreVertical,
  Paperclip,
  Send,
} from "lucide-react";
import { authStore } from "@/stores/auth-store";
import { conversationsApi, type Conversation, type Message } from "@/lib/api";

function MessageSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
          <div
            className={`h-10 w-48 animate-pulse rounded-2xl ${
              i % 2 === 0 ? "bg-muted" : "bg-teal/20"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

export default function TalentConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const currentUserId = useStore(authStore, (s) => s.user?._id);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendText, setSendText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const participant = conversation?.participant;
  const name = participant?.full_legal_name || participant?.company_name || "Unknown";
  const avatar = participant?.profile_photo || "/images/talent-avatar.jpg";
  const profession = participant?.professions?.[0] || participant?.role || "";
  const city = participant?.location?.city || "";
  const verified = (participant?.verification_tier ?? 0) >= 2;

  // Fetch conversation + messages
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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col border-border sm:max-w-lg sm:border-x">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-background/95 px-4 pb-3 pt-4 backdrop-blur">
          <div className="flex items-start gap-3">
            <Link
              href="/talent/messages"
              aria-label="Back"
              className="mt-2 grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="relative shrink-0">
              <Image
                src={avatar}
                alt={`${name} profile photo`}
                width={512}
                height={512}
                className="h-14 w-14 shrink-0 rounded-full border border-border object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold leading-tight">
                {loading ? "Loading..." : name}
              </h1>
              <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                {profession}
                {city && (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {city}
                  </>
                )}
              </p>
              {verified && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium">
                    <BadgeCheck className="h-3.5 w-3.5 text-primary" /> Verified
                  </span>
                </div>
              )}
            </div>
            <button
              aria-label="More options"
              className="mt-2 grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors hover:bg-accent"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5">
          {loading ? (
            <MessageSkeleton />
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No messages yet. Say hello!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">Conversation started</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              {messages.map((m) => {
                const isMe = m.sender_id === currentUserId;
                const time = new Date(m.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={m._id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isMe
                          ? "rounded-br-md bg-teal text-primary-foreground"
                          : "rounded-bl-md bg-bubble-in text-foreground"
                      }`}
                    >
                      <p>{m.content}</p>
                      <span
                        className={`mt-1 block text-[11px] ${
                          isMe ? "text-white/70" : "text-muted-foreground"
                        }`}
                      >
                        {time}
                        {isMe && m.status === "read" && (
                          <CheckCheck className="ml-1 inline h-3 w-3" />
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Composer */}
        <div className="sticky bottom-0 bg-background/95 px-4 pb-5 pt-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-surface px-3 py-2.5">
              <Paperclip className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={sendText}
                onChange={(e) => setSendText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Write a message..."
                aria-label="Write a message"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!sendText.trim() || sending}
              aria-label="Send message"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
