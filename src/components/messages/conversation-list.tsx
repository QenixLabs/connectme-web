"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { ConversationRow } from "./conversation-row";
import { EmptyState } from "./empty-state";
import { NewConversationDialog } from "./new-conversation-dialog";
import type { Conversation } from "@/lib/api/types";

type Filter = "All" | "Unread" | "Pinned";

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string | null;
  currentUserId: string;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  lastRef: (node: HTMLDivElement | null) => void;
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (id: string) => void;
  onConversationCreated: (conversation: Conversation) => void;
  unreadTotal: number;
  className?: string;
}

function ConversationSkeleton() {
  return (
    <Card className="gap-0 rounded-2xl border-border bg-surface-raised shadow-[var(--shadow-card)]">
      <CardContent className="p-3.5">
        <div className="flex items-center gap-3.5">
          <div className="size-12 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex justify-between">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-3 w-10 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-3.5 w-40 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConversationList({
  conversations,
  activeId,
  currentUserId,
  loading,
  loadingMore,
  hasMore,
  lastRef,
  filter,
  onFilterChange,
  query,
  onQueryChange,
  onSelect,
  onConversationCreated,
  unreadTotal,
  className,
}: ConversationListProps) {
  return (
    <div className={cn("flex h-full flex-col overflow-hidden bg-background", className)}>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 px-4 lg:px-5">
        <h1 className="text-xl font-bold tracking-tight">Messages</h1>
        <NewConversationDialog
          currentUserId={currentUserId}
          onCreated={onConversationCreated}
          onSelect={onSelect}
        />
      </div>

      <div className="space-y-3 border-b border-border/60 px-4 py-3 lg:px-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search conversations..."
            className="h-11 rounded-xl border-border bg-surface-raised pl-9 text-sm transition-colors focus-visible:border-primary/40 focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-surface-raised p-1">
          {(["All", "Unread", "Pinned"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFilterChange(f)}
              className={cn(
                "relative flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200",
                filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex items-center justify-center gap-1.5">
                {f}
                {f === "Unread" && unreadTotal > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {unreadTotal > 9 ? "9+" : unreadTotal}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-3 lg:px-5">
        <div className="space-y-2.5">
          {loading &&
            Array.from({ length: 5 }).map((_, i) => <ConversationSkeleton key={i} />)}

          {!loading && conversations.length === 0 && (
            <EmptyState
              icon={Search}
              title={
                filter === "Unread"
                  ? "No unread messages"
                  : filter === "Pinned"
                    ? "No pinned conversations"
                    : "No conversations yet"
              }
              description="When you connect with recruiters, your chats will appear here."
            />
          )}

          {conversations.map((c, i) => (
            <div key={c._id} ref={i === conversations.length - 1 ? lastRef : undefined}>
              <ConversationRow
                conversation={c}
                active={c._id === activeId}
                currentUserId={currentUserId}
                onSelect={() => onSelect(c._id)}
                index={i}
              />
            </div>
          ))}

          {loadingMore && <ConversationSkeleton />}

          {!hasMore && conversations.length > 0 && !loading && (
            <p className="py-4 text-center text-xs text-muted-foreground">No more conversations</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
