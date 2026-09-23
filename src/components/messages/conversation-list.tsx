"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Pin, Search, SlidersHorizontal, SquarePen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConversationRow } from "./conversation-row";
import { EmptyState } from "./empty-state";
import { NewConversationDialog } from "./new-conversation-dialog";
import { getConversationParticipant } from "@/lib/messages";
import type { Conversation } from "@/lib/api/types";

export type ConversationFilter = "All" | "Campaigns" | "Talent" | "Team";

export function isCampaignConversation(
  c: Conversation,
  currentUserId?: string
): boolean {
  if (!getFilterParticipant(c, currentUserId)) return true;
  return /campaign/i.test(c.last_message_preview || "");
}

function getFilterParticipant(c: Conversation, currentUserId?: string) {
  return getConversationParticipant(c, currentUserId) ?? c.participant;
}

export function matchesConversationFilter(
  c: Conversation,
  filter: ConversationFilter,
  currentUserId?: string
): boolean {
  if (filter === "All") return true;
  if (filter === "Campaigns") return isCampaignConversation(c, currentUserId);
  const p = getFilterParticipant(c, currentUserId);
  if (filter === "Talent") return p?.role === "talent";
  if (filter === "Team") {
    if (!p) return false;
    if (p.role === "recruiter" || p.role === "admin") return true;
    return (c.participant_ids?.length || 0) > 2;
  }
  return true;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string | null;
  currentUserId: string;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  lastRef: (node: HTMLDivElement | null) => void;
  filter: ConversationFilter;
  onFilterChange: (filter: ConversationFilter) => void;
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (id: string) => void;
  onConversationCreated: (conversation: Conversation) => void;
  unreadTotal?: number;
  emptyDescription?: string;
  className?: string;
  onMarkRead?: (conversationId: string) => void;
}

function ConversationSkeletonRow() {
  return (
    <div className="grid w-full min-w-0 max-w-full grid-cols-[48px_minmax(0,1fr)_56px] items-center gap-3 overflow-hidden border-b border-border/50 py-3" aria-hidden>
      <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-muted" />
      <div className="min-w-0 max-w-full space-y-1.5 overflow-hidden">
        <div className="h-4 w-1/2 max-w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 max-w-full animate-pulse rounded bg-muted" />
        <div className="h-3.5 w-3/4 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="flex w-14 min-w-0 max-w-full flex-col items-end gap-1.5 overflow-hidden">
        <div className="h-2.5 w-10 max-w-full animate-pulse rounded bg-muted" />
        <div className="size-6 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="truncate pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      {children}
    </h2>
  );
}

function dayGroup(dateStr: string): "today" | "yesterday" | "earlier" {
  const t = new Date(dateStr);
  if (Number.isNaN(t.getTime())) return "earlier";
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);
  if (t >= todayStart) return "today";
  if (t >= yesterdayStart) return "yesterday";
  return "earlier";
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
  emptyDescription = "When you connect with recruiters, your chats will appear here.",
  className,
  onMarkRead,
}: ConversationListProps) {
  const [pinnedOpen, setPinnedOpen] = useState(true);

  const pinnedItems = useMemo(
    () => conversations.filter((c) => c.user_settings?.[currentUserId]?.pinned),
    [conversations, currentUserId]
  );
  const showPinned = pinnedItems.length > 0;

  const rest = useMemo(
    () =>
      showPinned
        ? conversations.filter((c) => !c.user_settings?.[currentUserId]?.pinned)
        : conversations,
    [conversations, currentUserId, showPinned]
  );

  const groups = useMemo(() => {
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const earlier: Conversation[] = [];
    for (const c of rest) {
      const g = dayGroup(c.last_message_at);
      if (g === "today") today.push(c);
      else if (g === "yesterday") yesterday.push(c);
      else earlier.push(c);
    }
    return { today, yesterday, earlier };
  }, [rest]);

  function renderRows(items: Conversation[]) {
    return (
      <div className="w-full min-w-0 max-w-full overflow-hidden [&>article:last-child]:border-b-0 [&>div:last-child]:border-b-0">
        {items.map((c) => (
          <ConversationRow
            key={c._id}
            conversation={c}
            active={c._id === activeId}
            currentUserId={currentUserId}
            onSelect={() => onSelect(c._id)}
            onMarkRead={onMarkRead}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden bg-background", className)}>
      {/* Compact header */}
      <div className="w-full min-w-0 max-w-full shrink-0 overflow-hidden px-4 pb-1 pt-4">
        <h1 className="truncate text-lg font-bold tracking-tight">Messages</h1>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          Conversations that move opportunities forward.
        </p>
      </div>

      {/* Search + filter button */}
      <div className="flex w-full min-w-0 max-w-full shrink-0 items-center gap-2 overflow-hidden px-4 pb-2 pt-2">
        <div className="relative min-w-0 max-w-full flex-1 overflow-hidden">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search conversations..."
            aria-label="Search conversations"
            className="h-10 w-full rounded-full border-border bg-surface-raised pl-10 pr-4 text-sm transition-colors focus-visible:border-primary/40 focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Conversation filters"
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-raised transition-colors hover:bg-surface-2",
                filter !== "All" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <SlidersHorizontal className="size-[18px]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {(["All", "Campaigns", "Talent", "Team"] as const).map((f) => (
              <DropdownMenuItem
                key={f}
                onSelect={() => onFilterChange(f)}
                className={cn("cursor-pointer", filter === f && "font-semibold text-primary")}
              >
                {f === "All" ? "All conversations" : f === "Campaigns" ? "Campaigns only" : f === "Talent" ? "Talent only" : "Team only"}
              </DropdownMenuItem>
            ))}
            {query && (
              <DropdownMenuItem onSelect={() => onQueryChange("")} className="cursor-pointer">
                Clear search
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Segmented filter control */}
      <div
        role="tablist"
        aria-label="Conversation filters"
        className="grid w-full min-w-0 max-w-full shrink-0 grid-cols-4 overflow-hidden border-b border-border/60 px-4"
      >
        {(["All", "Campaigns", "Talent", "Team"] as const).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => onFilterChange(f)}
            className={cn(
              "relative min-w-0 truncate pb-2.5 pt-1 text-center text-[13px] transition-colors",
              filter === f
                ? "font-semibold text-foreground"
                : "font-medium text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="block truncate">{f}</span>
            {filter === f && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="relative min-h-0 w-full min-w-0 max-w-full flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full min-w-0 max-w-full">
          <div className="w-full min-w-0 max-w-full overflow-hidden px-4 pb-36 pt-1">
            {loading && (
              <div className="w-full min-w-0 max-w-full overflow-hidden [&>article:last-child]:border-b-0 [&>div:last-child]:border-b-0">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ConversationSkeletonRow key={i} />
                ))}
              </div>
            )}

            {!loading && conversations.length === 0 && (
              <EmptyState
                icon={Search}
                title={
                  filter === "Campaigns"
                    ? "No campaign conversations"
                    : filter === "Talent"
                      ? "No talent conversations"
                      : filter === "Team"
                        ? "No team conversations"
                        : "No conversations yet"
                }
                description={emptyDescription}
              />
            )}

            {!loading && conversations.length > 0 && (
              <>
                {showPinned && (
                  <section aria-label="Pinned conversations" className="w-full min-w-0 max-w-full overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setPinnedOpen((v) => !v)}
                      aria-expanded={pinnedOpen}
                      className="flex w-full min-w-0 max-w-full items-center gap-1.5 overflow-hidden pb-1.5 pt-2 text-left"
                    >
                      <Pin className="size-3.5 shrink-0 text-gold" aria-hidden />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        Pinned
                      </span>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        · {pinnedItems.length}
                      </span>
                      <ChevronDown
                        className={cn(
                          "ml-auto size-4 shrink-0 text-muted-foreground transition-transform",
                          pinnedOpen && "rotate-180"
                        )}
                      />
                    </button>
                    {pinnedOpen && renderRows(pinnedItems)}
                  </section>
                )}

                {groups.today.length > 0 && (
                  <section aria-label="Today" className="w-full min-w-0 max-w-full overflow-hidden">
                    <SectionLabel>Today</SectionLabel>
                    {renderRows(groups.today)}
                  </section>
                )}
                {groups.yesterday.length > 0 && (
                  <section aria-label="Yesterday" className="w-full min-w-0 max-w-full overflow-hidden">
                    <SectionLabel>Yesterday</SectionLabel>
                    {renderRows(groups.yesterday)}
                  </section>
                )}
                {groups.earlier.length > 0 && (
                  <section aria-label="Earlier" className="w-full min-w-0 max-w-full overflow-hidden">
                    <SectionLabel>Earlier</SectionLabel>
                    {renderRows(groups.earlier)}
                  </section>
                )}
              </>
            )}

            {loadingMore && (
              <div className="w-full min-w-0 max-w-full overflow-hidden [&>article:last-child]:border-b-0 [&>div:last-child]:border-b-0">
                <ConversationSkeletonRow />
              </div>
            )}

            {hasMore && !loading && <div ref={lastRef} className="h-1 w-full min-w-0 max-w-full" aria-hidden />}

            {!hasMore && conversations.length > 0 && !loading && (
              <div className="w-full min-w-0 px-4 py-5 text-center">
                <p className="text-sm text-muted-foreground">
                  No more conversations
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Floating New Message CTA above bottom navigation */}
        <div className="pointer-events-none fixed bottom-[88px] right-5 z-30">
          <span className="pointer-events-auto">
            <NewConversationDialog
              currentUserId={currentUserId}
              onCreated={onConversationCreated}
              onSelect={onSelect}
              trigger={
                <button
                  type="button"
                  aria-label="New message"
                  className="flex h-12 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:brightness-110 active:scale-95"
                >
                  <SquarePen className="size-4" />
                  New Message
                </button>
              }
            />
          </span>
        </div>
      </div>
    </div>
  );
}
