"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Send, MessageSquare, ArrowLeft, MoreVertical, Paperclip, Check, MessageCircle, Ban, UserX, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { messagesApi, type Conversation, type Message, type ConversationParticipant } from "@/lib/api/messages";
import { queryKeys } from "@/lib/api/query-keys";
import { useSocket } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SafetyMenu } from "./safety-menu";

interface ChatInterfaceProps {
  currentUserId: string;
  initialConversationId?: string | null;
  initialDraft?: string | null;
  dashboardUrl?: string;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return "Today";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString();
}

function getParticipantId(p: string | ConversationParticipant): string {
  return typeof p === "string" ? p : String(p._id);
}

function getOtherParticipant(conversation: Conversation, currentUserId: string): ConversationParticipant | null {
  const other = conversation.participant_ids.find((p) => getParticipantId(p) !== currentUserId);
  return typeof other === "object" && other !== null ? other : null;
}

function getOtherParticipantId(conversation: Conversation, currentUserId: string): string {
  const other = getOtherParticipant(conversation, currentUserId);
  return other ? String(other._id) : "";
}

function getDisplayName(participant: ConversationParticipant | null, fallbackId: string): string {
  if (!participant) return `User ${fallbackId.slice(-6)}`;
  if (participant.role === "recruiter") {
    return participant.company_name || participant.email || `User ${String(participant._id).slice(-6)}`;
  }
  return participant.full_legal_name || participant.username || participant.email || `User ${String(participant._id).slice(-6)}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function UserAvatar({
  photo,
  name,
  className,
}: {
  photo?: string;
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden",
        className
      )}
    >
      {photo ? (
        <img src={photo} alt={name} className="w-full h-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}

function generateClientId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ChatInterface({ currentUserId, initialConversationId, initialDraft, dashboardUrl }: ChatInterfaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId || null);
  const [showMobileChat, setShowMobileChat] = useState(!!initialConversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState(initialDraft || "");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [conversationsError, setConversationsError] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [blockedUsersOpen, setBlockedUsersOpen] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<{ _id: string; blocked_id: { _id: string; email: string; full_legal_name?: string; username?: string; company_name?: string; role?: string }; created_at: string }[]>([]);
  const [loadingBlockedUsers, setLoadingBlockedUsers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { socket } = useSocket();
  const initialDraftRef = useRef(initialDraft);
  initialDraftRef.current = initialDraft;

  const selectedConversation = conversations.find((c) => c._id === selectedConversationId);
  const selectedConversationIdRef = useRef(selectedConversationId);
  selectedConversationIdRef.current = selectedConversationId;

  // React to initialConversationId prop changes (e.g., URL query param changes while component mounted)
  useEffect(() => {
    if (initialConversationId) {
      setSelectedConversationId(initialConversationId);
      setShowMobileChat(true);
    }
  }, [initialConversationId]);

  // Load conversations on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingConversations(true);
    setConversationsError(null);
    messagesApi
      .getConversations()
      .then((data) => {
        if (cancelled) return;
        setConversations(data);
        if (data.length > 0) {
          setSelectedConversationId((prev) => {
            if (prev) return prev;
            return data[0]._id;
          });
        }
      })
      .catch((err) => {
        if (!cancelled) setConversationsError(getApiErrorMessage(err, 'Failed to load conversations'));
      })
      .finally(() => {
        if (!cancelled) setLoadingConversations(false);
      });
    return () => { cancelled = true; };
  }, []);

  // If initialConversationId is set but not in loaded conversations, fetch it directly
  useEffect(() => {
    if (!initialConversationId || loadingConversations) return;
    const exists = conversations.some((c) => c._id === initialConversationId);
    if (exists) return;

    messagesApi.getConversation(initialConversationId)
      .then((conv) => {
        setConversations((prev) => [...prev, conv]);
      })
      .catch(() => {
        // Conversation may not exist or user not a participant; ignore
      });
  }, [initialConversationId, loadingConversations, conversations]);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedConversationId) return;
    setLoadingMessages(true);
    setMessages([]);
    messagesApi
      .getMessages(selectedConversationId)
      .then(async (data) => {
        const ordered = data.reverse();
        setMessages(ordered);

        // Mark all unread messages as read and clear local unread count
        const unreadFromOthers = ordered.filter(
          (m) => String(m.sender_id._id) !== currentUserId && !m.read_by?.includes(currentUserId)
        );
        if (unreadFromOthers.length > 0) {
          try {
            const result = await messagesApi.markAllAsRead(selectedConversationId);
            queryClient.invalidateQueries({ queryKey: queryKeys.messages.unreadCount() });
            // Update local conversation unread count to 0
            setConversations((prev) =>
              prev.map((c) =>
                c._id === selectedConversationId
                  ? { ...c, unread_counts: { ...c.unread_counts, [currentUserId]: 0 } }
                  : c
              )
            );
            // Emit read receipts so sender sees them
            for (const msgId of result.message_ids) {
              socket?.emit("message:read", {
                conversation_id: selectedConversationId,
                message_id: msgId,
              });
            }
          } catch {
            // silently fail; unread state stays but no crash
          }
        }
      })
      .finally(() => setLoadingMessages(false));

    // Join conversation room
    socket?.emit("conversation:join", { conversation_id: selectedConversationId });
    return () => {
      socket?.emit("conversation:leave", { conversation_id: selectedConversationId });
    };
  }, [selectedConversationId, socket, currentUserId]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      const isActiveConv = message.conversation_id === selectedConversationIdRef.current;
      const isFromOther = message.sender_id._id !== currentUserId;

      if (isActiveConv) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        if (isFromOther) {
          messagesApi.markAsRead(message.conversation_id, message._id);
          socket.emit("message:read", {
            conversation_id: message.conversation_id,
            message_id: message._id,
          });
        }
      }
      setConversations((prev) =>
        prev
          .map((c) =>
            c._id === message.conversation_id
              ? {
                  ...c,
                  last_message_preview: message.content.slice(0, 100),
                  last_message_at: message.created_at,
                  unread_counts: {
                    ...c.unread_counts,
                    [currentUserId]: isFromOther && !isActiveConv ? (c.unread_counts[currentUserId] || 0) + 1 : c.unread_counts[currentUserId],
                  },
                }
              : c
          )
          .sort((a, b) => new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime())
      
      );
    };

    const handleReadReceipt = (data: { message_id: string; conversation_id: string; user_id: string }) => {
      if (data.conversation_id !== selectedConversationIdRef.current) return;
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.message_id
            ? { ...m, read_by: Array.from(new Set([...(m.read_by || []), data.user_id])) }
            : m
        )
      );
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:read_receipt", handleReadReceipt);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:read_receipt", handleReadReceipt);
    };
  }, [socket, currentUserId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Scroll to bottom when messages finish loading
  useEffect(() => {
    if (!loadingMessages && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [loadingMessages, messages.length]);

  // Auto-focus input when conversation is selected
  useEffect(() => {
    if (selectedConversationId && !loadingMessages && !isBlocked) {
      inputRef.current?.focus();
    }
  }, [selectedConversationId, loadingMessages, isBlocked]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || !selectedConversationId || isBlocked) return;

    const content = inputValue.trim();
    const clientMessageId = generateClientId();
    setInputValue("");

    const optimisticMessage: Message = {
      _id: clientMessageId,
      conversation_id: selectedConversationId,
      sender_id: { _id: currentUserId, email: "" },
      content,
      message_type: "text",
      status: "sending",
      read_by: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const sent = await messagesApi.sendMessage(selectedConversationId, content, clientMessageId);
      setMessages((prev) => {
        if (prev.some((m) => m._id === sent._id)) {
          return prev.filter((m) => m._id !== clientMessageId);
        }
        return prev.map((m) => (m._id === clientMessageId ? sent : m));
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m._id === clientMessageId ? { ...m, status: "failed" } : m))
      );
    }
  }, [inputValue, selectedConversationId, currentUserId, isBlocked]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const loadBlockedUsers = useCallback(async () => {
    setLoadingBlockedUsers(true);
    try {
      const data = await messagesApi.getBlockedUsers();
      setBlockedUsers(data);
    } catch {
      setBlockedUsers([]);
    } finally {
      setLoadingBlockedUsers(false);
    }
  }, []);

  const handleUnblock = async (blockedId: string) => {
    try {
      await messagesApi.unblockUser(blockedId);
      setBlockedUsers((prev) => prev.filter((b) => b.blocked_id._id !== blockedId));
      if (otherId === blockedId) {
        setIsBlocked(false);
        setBlockedByMe(false);
      }
    } catch {
      // silently fail
    }
  };

  const unreadCount = (conversation: Conversation) => conversation.unread_counts[currentUserId] || 0;

  const otherParticipant = selectedConversation ? getOtherParticipant(selectedConversation, currentUserId) : null;
  const otherId = selectedConversation ? getOtherParticipantId(selectedConversation, currentUserId) : "";
  const otherName = selectedConversation ? getDisplayName(otherParticipant, otherId) : "";

  // Check block status when conversation changes
  useEffect(() => {
    if (!selectedConversationId || !otherId) {
      setIsBlocked(false);
      setBlockedByMe(false);
      return;
    }
    messagesApi.checkBlocked(otherId)
      .then((res) => {
        setIsBlocked(res.isBlocked);
        setBlockedByMe(res.blockedByMe);
      })
      .catch(() => {
        setIsBlocked(false);
        setBlockedByMe(false);
      });
  }, [selectedConversationId, otherId]);

  if (loadingConversations) {
    return (
      <div className="flex flex-1 gap-4">
        <div className="w-80 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <div className="flex-1 bg-card rounded-xl border border-border" />
      </div>
    );
  }

  if (conversations.length === 0 && !initialConversationId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold">
            {conversationsError ? 'Could not load conversations' : 'No conversations yet'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {conversationsError || 'Start messaging after connecting with others.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 gap-0 md:gap-4 bg-page">
      {/* Conversation List */}
      <div className={`flex-col min-h-0 bg-card border-r border-border md:border md:rounded-xl overflow-hidden shadow-sm ${showMobileChat ? 'hidden md:flex md:w-80' : 'w-full flex md:w-80'}`}>
        {/* Inbox Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-card to-slate-50/50">
          {dashboardUrl && (
            <button
              onClick={() => router.push(dashboardUrl)}
              className="p-1 -ml-1 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
          <h2 className="text-sm font-semibold text-foreground">Messages</h2>
          <button
            onClick={() => {
              setBlockedUsersOpen(true);
              loadBlockedUsers();
            }}
            className="ml-auto p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Blocked users"
          >
            <UserX className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => {
            const other = getOtherParticipant(conversation, currentUserId);
            const otherIdLocal = other?._id || getOtherParticipantId(conversation, currentUserId);
            const isActive = conversation._id === selectedConversationId;
            const count = unreadCount(conversation);
            const isUnread = count > 0;

            return (
              <button
                key={conversation._id}
                onClick={() => {
                  setSelectedConversationId(conversation._id);
                  setShowMobileChat(true);
                  const params = new URLSearchParams();
                  params.set("conversationId", conversation._id);
                  router.push(`${pathname}?${params.toString()}`, { scroll: false });
                }}
                className={cn(
                  "w-full text-left flex items-center gap-3 px-3 py-2.5 border-b border-border transition-all duration-200 relative",
                  isActive && "bg-amber-50/60",
                  !isActive && isUnread && "bg-amber-50/40 hover:bg-amber-50/80",
                  !isActive && !isUnread && "hover:bg-slate-50"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-amber-500 rounded-r-full" />
                )}

                {/* Avatar */}
                <UserAvatar
                  photo={other?.profile_photo}
                  name={getDisplayName(other, otherIdLocal)}
                  className={cn(
                    "w-[38px] h-[38px] text-[10px] font-semibold shadow-sm",
                    isUnread
                      ? "bg-amber-100 border-[1.5px] border-amber-300 text-amber-800"
                      : "bg-slate-100 border-[1.5px] border-slate-200 text-slate-600"
                  )}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs truncate", isUnread ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                      {getDisplayName(other, otherIdLocal)}
                    </span>
                    {conversation.last_message_at && (
                      <span className="text-[9.5px] text-muted-foreground flex-shrink-0 ml-2">
                        {formatDate(conversation.last_message_at) === "Today"
                          ? formatTime(conversation.last_message_at)
                          : formatDate(conversation.last_message_at)}
                      </span>
                    )}
                  </div>
                  <p className={cn("text-[10.5px] truncate mt-0.5", isUnread ? "font-medium text-slate-600" : "text-slate-500")}>
                    {conversation.last_message_preview || "No messages yet"}
                  </p>
                </div>

                {count > 0 && (
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-semibold flex items-center justify-center flex-shrink-0 shadow-sm">
                    {count > 9 ? "9+" : count}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-card md:border md:rounded-xl min-h-0 shadow-sm ${showMobileChat ? 'flex w-full md:flex' : 'hidden md:flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm z-10 shrink-0">
              <button
                onClick={() => {
                  setShowMobileChat(false);
                  router.push(pathname, { scroll: false });
                }}
                className="md:hidden p-1 -ml-1 rounded-full hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Avatar with online dot */}
              <div className="relative">
                <UserAvatar
                  photo={otherParticipant?.profile_photo}
                  name={otherName}
                  className="w-[32px] h-[32px] bg-amber-100 border-[1.5px] border-amber-200 text-amber-800 text-[10px] font-semibold shadow-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-card rounded-full" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate leading-tight">{otherName}</div>
                {otherParticipant?.role === "recruiter" && (
                  <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[9px] font-medium px-1.5 py-px rounded-full mt-0.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    Verified
                  </div>
                )}
              </div>

              <SafetyMenu
                otherUserId={otherId}
                otherUserName={otherName}
                conversationId={selectedConversationId || undefined}
                onBlocked={() => {
                  setIsBlocked(true);
                  setBlockedByMe(true);
                  setConversations((prev) => prev.filter((c) => c._id !== selectedConversationId));
                  setSelectedConversationId(null);
                  setShowMobileChat(false);
                }}
              />
              <button className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto space-y-1"
              style={{
                backgroundColor: '#f8fafc',
                backgroundImage: `radial-gradient(circle, #e2e8f0 0.5px, transparent 0.5px)`,
                backgroundSize: '16px 16px',
              }}
            >
              {loadingMessages ? (
                <div className="space-y-3 pt-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-3/4" />
                  ))}
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const isOwn = String(msg.sender_id._id) === currentUserId;
                    const showDate =
                      index === 0 ||
                      formatDate(messages[index - 1].created_at) !== formatDate(msg.created_at);

                    return (
                      <div key={msg._id}>
                        {showDate && (
                          <div className="flex justify-center my-3">
                            <span className="text-[9.5px] text-muted-foreground bg-card/80 backdrop-blur-sm border border-border/60 px-3 py-1 rounded-full shadow-sm">
                              {formatDate(msg.created_at)}
                            </span>
                          </div>
                        )}

                        <div className={cn("flex items-end gap-1.5 mb-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300", isOwn ? "justify-end" : "justify-start")}>
                          {/* Avatar for received */}
                          {!isOwn && (
                            <UserAvatar
                              photo={otherParticipant?.profile_photo}
                              name={otherName}
                              className="w-[24px] h-[24px] bg-slate-100 border border-slate-200 text-slate-600 text-[8px] font-semibold mb-0.5 shadow-sm"
                            />
                          )}

                          <div className="max-w-[78%]">
                            <div
                              className={cn(
                                "px-3 py-2 text-[11px] leading-relaxed shadow-sm transition-transform hover:scale-[1.01]",
                                isOwn
                                  ? "bg-amber-500 text-white"
                                  : "bg-card text-foreground border border-border/80"
                              )}
                              style={{
                                borderRadius: isOwn
                                  ? "16px 16px 4px 16px"
                                  : "16px 16px 16px 4px",
                              }}
                            >
                              <ReactMarkdown
                                disallowedElements={['img', 'script', 'style', 'iframe', 'object', 'embed', 'form', 'input']}
                                unwrapDisallowed
                                components={{
                                  p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                                  a: ({ href, children }) => {
                                    const isCampaignLink = href?.startsWith('/talent/opportunities/');
                                    if (isCampaignLink) {
                                      return (
                                        <a
                                          href={href}
                                          className="inline-block px-3 py-1.5 bg-amber-500 text-white rounded-md text-xs font-medium no-underline hover:opacity-90 transition-opacity"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {children}
                                        </a>
                                      );
                                    }
                                    return (
                                      <a href={href} className="underline opacity-90 hover:opacity-100" target="_blank" rel="noopener noreferrer">
                                        {children}
                                      </a>
                                    );
                                  },
                                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                  em: ({ children }) => <em>{children}</em>,
                                  ul: ({ children }) => <ul className="list-disc pl-4 mb-1">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-1">{children}</ol>,
                                  li: ({ children }) => <li className="mb-0.5">{children}</li>,
                                  code: ({ children }) => <code className="bg-black/10 rounded px-1 py-0.5 text-xs">{children}</code>,
                                  pre: ({ children }) => <pre className="bg-black/10 rounded p-2 overflow-x-auto text-xs mb-1">{children}</pre>,
                                  blockquote: ({ children }) => (
                                    <blockquote className="border-l-2 border-current pl-2 opacity-80 italic mb-1">{children}</blockquote>
                                  ),
                                  h1: ({ children }) => <h1 className="text-base font-semibold mb-1">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-sm font-semibold mb-1">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                            <div
                              className={cn(
                                "text-[9px] text-muted-foreground mt-0.5 flex items-center gap-1",
                                isOwn ? "justify-end" : "justify-start"
                              )}
                            >
                              {formatTime(msg.created_at)}
                              {isOwn && msg.status === "failed" && (
                                <span className="text-destructive text-[9px]">Failed</span>
                              )}
                              {isOwn && msg.status !== "failed" && (
                                <span className="inline-flex items-center">
                                  {msg.read_by?.some((id) => id !== currentUserId) ? (
                                    <span className="inline-flex items-center text-emerald-600">
                                      <Check className="w-2.5 h-2.5" strokeWidth={3} />
                                      <Check className="w-2.5 h-2.5 -ml-1.5" strokeWidth={3} />
                                    </span>
                                  ) : (
                                    <Check className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={3} />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input / Blocked */}
            {isBlocked ? (
              <div className="px-3 py-3 border-t border-border bg-red-50/80 backdrop-blur-md flex items-center justify-center gap-2 z-10 shrink-0">
                <Ban className="w-4 h-4 text-red-500" strokeWidth={1.5} />
                <span className="text-xs text-red-600 font-medium">
                  {blockedByMe ? "You have blocked this user" : "You have been blocked by this user"}
                </span>
              </div>
            ) : (
              <div className="px-3 py-2.5 border-t border-border bg-card/90 backdrop-blur-md flex items-center gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-10 shrink-0">
                <button className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 text-xs bg-slate-50/80 border border-border rounded-full px-3.5 py-2 outline-none focus:border-amber-400 focus:bg-white transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-sm",
                    inputValue.trim()
                      ? "bg-amber-500 text-white hover:bg-amber-600 hover:shadow-md hover:scale-105"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3" style={{ backgroundColor: '#f8fafc', backgroundImage: `radial-gradient(circle, #e2e8f0 0.5px, transparent 0.5px)`, backgroundSize: '16px 16px' }}>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-amber-300" />
            </div>
            <p className="text-sm font-medium">Select a conversation</p>
            <p className="text-xs text-muted-foreground">Choose someone from the list to start messaging</p>
          </div>
        )}
      </div>

      {/* Blocked Users Dialog */}
      <Dialog open={blockedUsersOpen} onOpenChange={setBlockedUsersOpen}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3">
            <DialogTitle className="text-base font-semibold text-center">Blocked Users</DialogTitle>
          </DialogHeader>
          <div className="px-5 pb-5">
            {loadingBlockedUsers ? (
              <div className="flex justify-center py-6">
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : blockedUsers.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No blocked users.
              </div>
            ) : (
              <div className="space-y-2">
                {blockedUsers.map((b) => {
                  const user = b.blocked_id;
                  const name = user.full_legal_name || user.company_name || user.username || user.email;
                  return (
                    <div
                      key={b._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-card border border-border"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnblock(user._id)}
                        className="text-xs shrink-0"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Unblock
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
