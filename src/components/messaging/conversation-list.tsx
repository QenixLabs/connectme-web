"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { ArrowLeft, UserX, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConversationCard } from "./conversation-card";
import { EmptyListState } from "./empty-list-state";
import { getDisplayName, getOtherParticipant, getOtherParticipantId } from "./utils";
import { messagesApi, type Conversation } from "@/lib/api/messages";
import { getApiErrorMessage } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useSocket } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  currentUserId: string;
  role: "talent" | "recruiter";
  findPeopleUrl?: string;
  dashboardUrl?: string;
}

export function ConversationList({
  currentUserId,
  role,
  findPeopleUrl,
  dashboardUrl,
}: ConversationListProps) {
  const router = useRouter();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [blockedUsersOpen, setBlockedUsersOpen] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<
    {
      _id: string;
      blocked_id: {
        _id: string;
        email: string;
        full_legal_name?: string;
        username?: string;
        company_name?: string;
        role?: string;
      };
      created_at: string;
    }[]
  >([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    messagesApi
      .getConversations()
      .then((data) => {
        if (cancelled) return;
        setConversations(data.data);
        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
      })
      .catch((err) => {
        if (!cancelled)
          setError(getApiErrorMessage(err, "Failed to load conversations"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await messagesApi.getConversations(cursor);
      setConversations((prev) => [...prev, ...data.data]);
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: {
      _id: string;
      conversation_id: string;
      content: string;
      created_at: string;
      sender_id: { _id: string };
    }) => {
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
                    [currentUserId]:
                      message.sender_id._id !== currentUserId
                        ? (c.unread_counts[currentUserId] || 0) + 1
                        : c.unread_counts[currentUserId],
                  },
                }
              : c,
          )
          .sort(
            (a, b) =>
              new Date(b.last_message_at || 0).getTime() -
              new Date(a.last_message_at || 0).getTime(),
          ),
      );
    };

    socket.on("message:new", handleNewMessage);
    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [socket, currentUserId]);

  const loadBlockedUsers = useCallback(async () => {
    setLoadingBlocked(true);
    try {
      const data = await messagesApi.getBlockedUsers();
      setBlockedUsers(data);
    } catch {
      setBlockedUsers([]);
    } finally {
      setLoadingBlocked(false);
    }
  }, []);

  const handleUnblock = async (blockedId: string) => {
    try {
      await messagesApi.unblockUser(blockedId);
      setBlockedUsers((prev) =>
        prev.filter((b) => b.blocked_id._id !== blockedId),
      );
    } catch {
      // silently fail
    }
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => {
      const other = getOtherParticipant(c, currentUserId);
      const otherId = getOtherParticipantId(c, currentUserId);
      const name = getDisplayName(other, otherId).toLowerCase();
      return name.includes(q);
    });
  }, [conversations, searchQuery, currentUserId]);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 px-4 py-3 border-b border-msg-border bg-white/80">
          <Skeleton className="h-7 w-32 rounded-lg" />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

    return (
      <div className="flex flex-col h-full">
        <div
          className="shrink-0 px-4 py-3 border-b border-msg-border flex items-center gap-3 sticky top-0 z-10 bg-white/80 backdrop-blur-sm"
        >
          {dashboardUrl && (
            <button
              onClick={() => router.push(dashboardUrl)}
              className="p-1.5 -ml-1 rounded-full hover:bg-msg-ink/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-msg-ink" strokeWidth={1.5} />
            </button>
          )}
          <h1 className="text-lg font-semibold text-msg-ink font-[family-name:var(--font-playfair)] tracking-tight">
            Messages
          </h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  setBlockedUsersOpen(true);
                  loadBlockedUsers();
                }}
                className="ml-auto p-1.5 rounded-full text-msg-ink-muted hover:text-msg-ink hover:bg-msg-ink/5 transition-colors"
              >
                <UserX className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Blocked users</TooltipContent>
          </Tooltip>
        </div>

      {conversations.length > 0 && (
        <div className="shrink-0 px-4 py-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full text-[12px] bg-cream border border-border rounded-xl pl-9 pr-3 py-2 outline-none focus:border-gold/40 focus:bg-white transition-all placeholder:text-ink-muted"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 max-w-2xl mx-auto w-full">
        {conversations.length === 0 ? (
          <EmptyListState error={error} findPeopleUrl={findPeopleUrl} />
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <p className="text-[13px] text-ink-muted">No matches for &ldquo;{searchQuery}&rdquo;</p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-[12px] text-gold hover:text-gold-ink transition-colors font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            {filteredConversations.map((conversation, index) => (
              <ConversationCard
                key={conversation._id}
                conversation={conversation}
                currentUserId={currentUserId}
                isActive={false}
                index={index}
                role={role}
              />
            ))}
            {hasMore && !searchQuery.trim() && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full py-2.5 text-[12px] font-medium text-ink-muted hover:text-ink transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            )}
          </>
        )}
      </div>

      <Dialog open={blockedUsersOpen} onOpenChange={setBlockedUsersOpen}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3">
            <DialogTitle className="text-base font-semibold text-center">
              Blocked Users
            </DialogTitle>
          </DialogHeader>
          <div className="px-5 pb-5">
            {loadingBlocked ? (
              <div className="flex justify-center py-6">
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : blockedUsers.length === 0 ? (
              <div className="text-center py-6 text-sm text-ink-muted">
                No blocked users.
              </div>
            ) : (
              <div className="space-y-2">
                {blockedUsers.map((b) => {
                  const user = b.blocked_id;
                  const name =
                    user.full_legal_name ||
                    user.company_name ||
                    user.username ||
                    user.email;
                  return (
                    <div
                      key={b._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-card border border-border"
                    >
                      <div className="min-w-0 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-cream text-ink-soft text-[10px] font-semibold flex items-center justify-center shrink-0">
                          {name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate">{name}</p>
                          <p className="text-xs text-ink-muted truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnblock(user._id)}
                        className="text-xs shrink-0"
                      >
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
