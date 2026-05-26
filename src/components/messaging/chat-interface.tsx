"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, MessageSquare, User, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { messagesApi, type Conversation, type Message, type ConversationParticipant } from "@/lib/api/messages";
import { useSocket } from "@/hooks/use-socket";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
  if (participant.role === 'recruiter') {
    return participant.company_name || participant.email || `User ${String(participant._id).slice(-6)}`;
  }
  return participant.full_legal_name || participant.username || participant.email || `User ${String(participant._id).slice(-6)}`;
}

function generateClientId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ChatInterface({ currentUserId, initialConversationId, initialDraft, dashboardUrl }: ChatInterfaceProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId || null);
  const [showMobileChat, setShowMobileChat] = useState(!!initialConversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState(initialDraft || "");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();
  const initialDraftRef = useRef(initialDraft);
  initialDraftRef.current = initialDraft;

  const selectedConversation = conversations.find((c) => c._id === selectedConversationId);
  const selectedConversationIdRef = useRef(selectedConversationId);
  selectedConversationIdRef.current = selectedConversationId;

  // Load conversations once on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingConversations(true);
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
      .finally(() => {
        if (!cancelled) setLoadingConversations(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedConversationId) return;
    setLoadingMessages(true);
    setMessages([]);
    messagesApi
      .getMessages(selectedConversationId)
      .then((data) => setMessages(data.reverse()))
      .finally(() => setLoadingMessages(false));

    // Join conversation room
    socket?.emit("conversation:join", { conversation_id: selectedConversationId });
    return () => {
      socket?.emit("conversation:leave", { conversation_id: selectedConversationId });
    };
  }, [selectedConversationId, socket]);

  // Socket listeners (stable registration via ref to avoid race conditions)
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      if (message.conversation_id === selectedConversationIdRef.current) {
        setMessages((prev) => {
          // Dedup: ignore if already in list (e.g. own message from HTTP response)
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        // Mark as read if from other user
        if (message.sender_id._id !== currentUserId) {
          messagesApi.markAsRead(message.conversation_id, message._id);
          socket.emit("message:read", {
            conversation_id: message.conversation_id,
            message_id: message._id,
          });
        }
      }
      // Update conversation preview
      setConversations((prev) =>
        prev.map((c) =>
          c._id === message.conversation_id
            ? {
                ...c,
                last_message_preview: message.content.slice(0, 100),
                last_message_at: message.created_at,
                unread_counts: {
                  ...c.unread_counts,
                  [currentUserId]: message.sender_id._id !== currentUserId ? (c.unread_counts[currentUserId] || 0) + 1 : c.unread_counts[currentUserId],
                },
              }
            : c
        )
      );
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [socket, currentUserId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || !selectedConversationId) return;

    const content = inputValue.trim();
    const clientMessageId = generateClientId();
    setInputValue("");

    // Optimistic update
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
        // Dedup: socket may have already added the real message before HTTP response
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
  }, [inputValue, selectedConversationId, currentUserId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const unreadCount = (conversation: Conversation) => conversation.unread_counts[currentUserId] || 0;

  if (loadingConversations) {
    return (
      <div className="flex h-[calc(100vh-120px)] gap-4">
        <div className="w-80 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <Card className="flex-1" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center space-y-4">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-semibold">No conversations yet</h2>
          <p className="text-sm text-muted-foreground">
            Start messaging after connecting with others.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] md:h-[calc(100vh-120px)] gap-4">
      {/* Conversation List */}
      <Card className={`flex-col overflow-hidden ${showMobileChat ? 'hidden md:flex md:w-80' : 'w-full flex md:w-80'}`}>
        <div className="p-4 border-b flex items-center gap-3">
          {dashboardUrl && (
            <button
              onClick={() => router.push(dashboardUrl)}
              className="p-1 -ml-1 rounded hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
          <h2 className="font-semibold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => {
            const other = getOtherParticipant(conversation, currentUserId);
            const otherId = other?._id || getOtherParticipantId(conversation, currentUserId);
            const isActive = conversation._id === selectedConversationId;
            const count = unreadCount(conversation);

            return (
              <button
                key={conversation._id}
                onClick={() => {
                  setSelectedConversationId(conversation._id);
                  setShowMobileChat(true);
                }}
                className={`w-full text-left p-3 flex items-center gap-3 hover:bg-muted transition-colors ${
                  isActive ? "bg-muted" : ""
                }`}
              >
                <Avatar name={other?.full_legal_name || other?.username || other?.email || otherId.slice(-4)} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{getDisplayName(other, otherId)}</span>
                    {count > 0 && (
                      <Badge variant="default" className="text-xs px-1.5 py-0">
                        {count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {conversation.last_message_preview || "No messages yet"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className={`flex-1 flex-col overflow-hidden ${showMobileChat ? 'flex w-full md:flex' : 'hidden md:flex'}`}>
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-1 -ml-1 rounded hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">
                {getDisplayName(
                  getOtherParticipant(selectedConversation, currentUserId),
                  getOtherParticipantId(selectedConversation, currentUserId),
                )}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-3/4" />
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
                          <div className="flex justify-center my-4">
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                              {formatDate(msg.created_at)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[70%] px-4 py-2 rounded-lg ${
                              isOwn
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <div className="text-sm break-words">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                                  a: ({ href, children }) => (
                                    <a href={href} className="underline opacity-90 hover:opacity-100" target="_blank" rel="noopener noreferrer">
                                      {children}
                                    </a>
                                  ),
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
                              className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                                isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                              }`}
                            >
                              {formatTime(msg.created_at)}
                              {isOwn && msg.status === "failed" && (
                                <span className="text-destructive">Failed</span>
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

            {/* Input */}
            <div className="p-4 border-t flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon" disabled={!inputValue.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation
          </div>
        )}
      </Card>
    </div>
  );
}
