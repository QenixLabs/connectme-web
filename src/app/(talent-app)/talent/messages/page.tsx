"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "zustand/react";
import {
  BadgeCheck,
  Bell,
  CheckCheck,
  Paperclip,
  Search,
  Send,
  User,
  UserPlus,
} from "lucide-react";
import { authStore } from "@/stores/auth-store";
import { conversationsApi, type Conversation, type Message } from "@/lib/api";

const PAGE_SIZE = 20;

type Filter = "All" | "Unread";

function ConversationRow({
  c,
  active,
  onSelect,
  currentUserId,
  isLast,
  lastRef,
}: {
  c: Conversation;
  active: boolean;
  onSelect: () => void;
  currentUserId: string;
  isLast: boolean;
  lastRef?: (node: HTMLDivElement | null) => void;
}) {
  const p = c.participant;
  const name = p?.full_legal_name || p?.company_name || "Unknown";
  const avatar = p?.profile_photo || "/images/avatars/msg-talent.jpg";
  const profession = p?.professions?.[0] || p?.role || "";
  const city = p?.location?.city || "";
  const unreadCount = c.unread_counts[currentUserId] || 0;
  const isActive = unreadCount > 0;
  const isMe = c.last_message_sender_id === currentUserId;

  const timeStr = getTimeAgo(c.last_message_at);
  const preview = isMe ? `You: ${c.last_message_preview}` : c.last_message_preview;

  return (
    <div ref={isLast ? lastRef : undefined}>
      <button
        onClick={onSelect}
        className={`card-surface w-full rounded-2xl p-4 text-left transition-colors hover:border-teal/35 ${
          active ? "border-teal/50 bg-teal/5" : ""
        }`}
      >
        <div className="flex gap-3.5">
          <div className="relative shrink-0">
            <Image
              src={avatar}
              alt={`${name} profile photo`}
              width={512}
              height={512}
              className="size-14 rounded-full object-cover ring-2 ring-border"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="flex min-w-0 items-center gap-1.5 text-[17px] font-semibold tracking-tight">
                <span className="truncate">{name}</span>
                {(p?.verification_tier ?? 0) >= 2 && (
                  <BadgeCheck className="size-4 shrink-0 fill-teal text-card" aria-label="Verified" />
                )}
              </h3>
              <span className="shrink-0 text-xs text-muted-foreground">{timeStr}</span>
            </div>

            <p className="mt-0.5 text-sm text-muted-foreground">
              {profession} {city && <><span className="mx-1 text-muted-foreground/50">&bull;</span> {city}</>}
            </p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <p
                className={`min-w-0 flex-1 truncate text-[15px] ${
                  unreadCount > 0 ? "font-semibold text-foreground" : "text-foreground/75"
                }`}
              >
                {preview}
              </p>
              {unreadCount > 0 ? (
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-teal text-xs font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              ) : (
                c.last_message_sender_id === currentUserId && (
                  <CheckCheck className="size-4 shrink-0 text-teal" />
                )
              )}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

function ConversationSkeleton() {
  return (
    <div className="card-surface w-full rounded-2xl p-4">
      <div className="flex gap-3.5">
        <div className="size-14 shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex justify-between">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
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

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return new Date(dateStr).toLocaleDateString();
}

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

  const lastRowRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async (nextCursor?: string) => {
    if (nextCursor) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await conversationsApi.getConversations({
        cursor: nextCursor,
        limit: PAGE_SIZE,
      });
      const items = Array.isArray(data) ? data : [];
      if (nextCursor) {
        setConversations((prev) => [...prev, ...items]);
      } else {
        setConversations(items);
      }
      setHasMore(items.length === PAGE_SIZE);
      if (items.length > 0) {
        setCursor(items[items.length - 1]?._id);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore && cursor) {
          fetchConversations(cursor);
        }
      },
      { threshold: 0.1 },
    );

    if (lastRowRef.current) {
      observerRef.current.observe(lastRowRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, cursor, fetchConversations]);

  // Fetch messages when conversation selected
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

  // Filter conversations
  const safeConversations = Array.isArray(conversations) ? conversations : [];
  const filtered = safeConversations
    .filter((c) => {
      if (filter === "Unread") {
        return (c.unread_counts[currentUserId || ""] || 0) > 0;
      }
      return true;
    })
    .filter((c) => {
      if (!query) return true;
      const p = c.participant;
      const name = (p?.full_legal_name || p?.company_name || "").toLowerCase();
      const profession = (p?.professions?.[0] || "").toLowerCase();
      const q = query.toLowerCase();
      return name.includes(q) || profession.includes(q);
    });

  const active = safeConversations.find((c) => c._id === activeId) || null;
  const activeParticipant = active?.participant;
  const unreadTotal = safeConversations.reduce(
    (sum, c) => sum + (c.unread_counts[currentUserId || ""] || 0),
    0,
  );

  function handleSelect(id: string) {
    setActiveId(id);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      router.push(`/talent/messages/${id}`);
    }
  }

  async function handleSend() {
    if (!sendText.trim() || !active || sending) return;
    const content = sendText.trim();
    setSendText("");
    setSending(true);

    const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      const msg = await conversationsApi.sendMessage({
        conversation_id: active._id,
        content,
        client_message_id: clientId,
      });
      setMessages((prev) => [...prev, msg]);
      setConversations((prev) =>
        prev.map((c) =>
          c._id === active._id
            ? { ...c, last_message_preview: content, last_message_sender_id: currentUserId ?? null, last_message_at: new Date().toISOString() }
            : c,
        ),
      );
    } catch {
      // could add retry UI
    } finally {
      setSending(false);
    }
  }

  const activeName = activeParticipant?.full_legal_name || activeParticipant?.company_name || "Unknown";
  const activeAvatar = activeParticipant?.profile_photo || "/images/avatars/msg-talent.jpg";
  const activeProfession = activeParticipant?.professions?.[0] || activeParticipant?.role || "";
  const activeCity = activeParticipant?.location?.city || "";

  return (
    <div className="page-gradient min-h-screen">
      {/* Desktop header */}
      <header className="sticky top-0 z-30 hidden border-b border-border bg-background/85 backdrop-blur-xl lg:block">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
          <Link href="/talent/dashboard" className="text-2xl font-extrabold tracking-tight">
            Connect<span className="text-teal">Me</span>
          </Link>
          <nav className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/talent/requests" className="transition-colors hover:text-foreground">
              Requests
            </Link>
            <span className="transition-colors hover:text-foreground">Discover</span>
            <span className="text-foreground">Messages</span>
            <Link href="/talent/profile" className="transition-colors hover:text-foreground">
              Profile
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <Bell className="size-5" />
              <span className="absolute bottom-1.5 right-2 size-1.5 rounded-full bg-teal" />
            </button>
            <button className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <User className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-28 pt-6 lg:px-8 lg:pb-8">
        <div className="grid gap-6 lg:grid-cols-[26rem_1fr] lg:items-start">
          {/* List column */}
          <section className="overflow-hidden">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-extrabold tracking-tight">Messages</h1>
              <button
                aria-label="New message"
                className="rounded-full p-2 text-teal transition-colors hover:bg-teal/10"
              >
                <UserPlus className="size-6" />
              </button>
            </div>

            <label className="card-surface mt-4 flex items-center gap-3 rounded-2xl px-4 py-3 focus-within:border-teal/50">
              <Search className="size-5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
            </label>

            <div className="-mx-5 mt-4 flex gap-2.5 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0">
              {(["All", "Unread"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    filter === f
                      ? "border-teal/50 bg-teal/12 text-teal"
                      : "border-border bg-surface text-foreground/80 hover:border-teal/30"
                  }`}
                >
                  {f}
                  {f === "Unread" && unreadTotal > 0 && (
                    <span className="grid size-5 place-items-center rounded-full bg-teal text-[11px] font-bold text-primary-foreground">
                      {unreadTotal}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3 lg:max-h-[calc(100vh-19rem)] lg:overflow-y-auto lg:pr-1">
              {loading &&
                Array.from({ length: 4 }).map((_, i) => <ConversationSkeleton key={i} />)}

              {!loading && filtered.length === 0 && (
                <p className="py-16 text-center text-muted-foreground">
                  {filter === "Unread" ? "No unread messages." : "No conversations found."}
                </p>
              )}

              {filtered.map((c, i) => (
                <ConversationRow
                  key={c._id}
                  c={c}
                  active={c._id === activeId}
                  onSelect={() => handleSelect(c._id)}
                  currentUserId={currentUserId || ""}
                  isLast={i === filtered.length - 1}
                  lastRef={i === filtered.length - 1 ? (node) => { lastRowRef.current = node; } : undefined}
                />
              ))}

              {loadingMore && <ConversationSkeleton />}
            </div>
          </section>

          {/* Desktop conversation pane */}
          <section className="card-surface hidden h-[calc(100vh-8rem)] flex-col rounded-2xl lg:flex">
            {!active ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-muted-foreground">Select a conversation</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4 border-b border-border p-5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        src={activeAvatar}
                        alt={`${activeName} profile photo`}
                        width={512}
                        height={512}
                        className="size-12 rounded-full object-cover ring-2 ring-border"
                      />
                    </div>
                    <div>
                      <h2 className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
                        {activeName}
                        {(activeParticipant?.verification_tier ?? 0) >= 2 && (
                          <BadgeCheck className="size-4 fill-teal text-card" />
                        )}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {activeProfession}
                        {activeCity && <> &bull; {activeCity}</>}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {messagesLoading ? (
                    <MessageSkeleton />
                  ) : messages.length === 0 ? (
                    <p className="py-16 text-center text-muted-foreground">No messages yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((m) => {
                        const isMe = m.sender_id === currentUserId;
                        return (
                          <div
                            key={m._id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[68%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                                isMe
                                  ? "btn-accept rounded-br-md"
                                  : "rounded-bl-md bg-secondary text-foreground"
                              }`}
                            >
                              <p>{m.content}</p>
                              <span
                                className={`mt-1 block text-[11px] ${
                                  isMe ? "text-white/70" : "text-muted-foreground"
                                }`}
                              >
                                {new Date(m.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 border-t border-border p-4">
                  <button className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                    <Paperclip className="size-5" />
                  </button>
                  <input
                    value={sendText}
                    onChange={(e) => setSendText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={`Message ${activeName.split(" ")[0]}...`}
                    className="flex-1 rounded-xl bg-secondary px-4 py-3 text-base outline-none ring-teal/40 placeholder:text-muted-foreground focus:ring-2"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!sendText.trim() || sending}
                    aria-label="Send"
                    className="btn-accept grid size-11 shrink-0 place-items-center rounded-xl disabled:opacity-50"
                  >
                    <Send className="size-5" />
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

    </div>
  );
}
