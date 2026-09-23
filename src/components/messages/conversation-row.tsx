"use client";

import { memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Megaphone,
  MessageSquare,
  MoreVertical,
  Pin,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getConversationParticipant } from "@/lib/messages";
import { conversationsApi } from "@/lib/api";
import type { Conversation } from "@/lib/api/types";

interface ConversationRowProps {
  conversation: Conversation;
  active?: boolean;
  currentUserId: string;
  onSelect: () => void;
  index?: number;
  onMarkRead?: (conversationId: string) => void;
}

const CAMPAIGN_INVITATION_LABEL = "Campaign Invitation";

function PreviewContent({ text }: { text: string | null | undefined }) {
  const safeText = typeof text === "string" ? text : "";
  const idx = safeText.search(/campaign invitation/i);
  if (idx === -1) return <>{safeText}</>;
  const labelLength = CAMPAIGN_INVITATION_LABEL.length;
  const before = safeText.slice(0, idx).replace(/\*\*/g, "");
  const match = safeText.slice(idx, idx + labelLength).replace(/\*\*/g, "");
  const after = safeText.slice(idx + labelLength).replace(/\*\*/g, "");
  return (
    <>
      {before}
      <strong className="font-bold">{match}</strong>
      {after}
    </>
  );
}

function formatListTime(dateStr: string, now: Date): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);
  if (d >= startOfToday) {
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }
  if (d >= startOfYesterday) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function StatusIcon({ status }: { status: string }) {
  if (status === "sending" || status === "failed") {
    return <Clock className="size-3.5 opacity-70" />;
  }
  if (status === "read") {
    return <CheckCheck className="size-3.5 text-cyan" />;
  }
  if (status === "delivered") {
    return <CheckCheck className="size-3.5 opacity-70" />;
  }
  return <Check className="size-3.5 opacity-70" />;
}

const RECENTLY_ACTIVE_MS = 15 * 60 * 1000;

export const ConversationRow = memo(function ConversationRow({
  conversation,
  active,
  currentUserId,
  onSelect,
  onMarkRead,
}: ConversationRowProps) {
  const router = useRouter();
  const p = getConversationParticipant(conversation, currentUserId);
  const name = p?.full_legal_name || p?.company_name || p?.username || "Unknown";
  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  const avatar = p?.profile_photo;
  const profession = p?.professions?.[0] || p?.role || "";
  const city = p?.location?.city;
  const verified = (p?.verification_tier ?? 0) >= 2;
  const unread = conversation.unread_counts[currentUserId] || 0;
  const isMe = conversation.last_message_sender_id === currentUserId;
  const settings = conversation.user_settings?.[currentUserId];
  const pinned = settings?.pinned;
  const muted = settings?.muted;
  const username = p?.username;
  const role = p?.role;

  // System/campaign conversations have no other participant to resolve.
  // They get a simple branded icon avatar instead of a profile photo.
  const isSystem = !p;

  const lastAt = Date.parse(conversation.last_message_at);
  // Presence is a recent-activity heuristic (no presence API): dot shows only
  // when the thread updated within the last few minutes.
  const showPresence =
    !isSystem &&
    Boolean(avatar) &&
    Number.isFinite(lastAt) &&
    // eslint-disable-next-line react-hooks/purity -- wall-clock read for a presentational recency dot
    Date.now() - lastAt < RECENTLY_ACTIVE_MS;

  const lastMessagePreview =
    typeof conversation.last_message_preview === "string"
      ? conversation.last_message_preview
      : "";
  const preview = isMe ? `You: ${lastMessagePreview}` : lastMessagePreview;

  const timeLabel = useMemo(
    () => formatListTime(conversation.last_message_at, new Date()),
    [conversation.last_message_at]
  );

  function handleViewProfile(e?: { stopPropagation?: () => void }) {
    e?.stopPropagation?.();
    if (!username) return;
    const path = role === "recruiter" ? `/recruiter/${username}` : `/talent/${username}`;
    router.push(path);
  }

  function handleMarkRead() {
    if (onMarkRead) {
      onMarkRead(conversation._id);
      return;
    }
    conversationsApi
      .markAllRead(conversation._id)
      .then(() => toast.success("Marked as read"))
      .catch(() => toast.error("Could not mark as read"));
  }

  return (
    <article
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-label={`Open conversation with ${name}`}
      aria-current={active ? "true" : undefined}
      onKeyDown={(e) => {
        if ((e.target as HTMLElement | null)?.closest?.("[data-row-menu]")) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group grid w-full min-w-0 max-w-full cursor-pointer grid-cols-[48px_minmax(0,1fr)_56px] items-center gap-3 overflow-hidden border-b border-border/50 py-3 outline-none transition-colors",
        active ? "bg-primary/[0.06]" : "hover:bg-muted/30 focus-visible:bg-muted/30"
      )}
    >
      <div className="relative h-12 w-12 shrink-0 min-w-0">
        {isSystem ? (
          <span
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20"
          >
            <Megaphone className="size-5" />
          </span>
        ) : (
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={avatar} alt={`${name} profile photo`} />
            <AvatarFallback className="bg-muted text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
        {showPresence && (
          <span
            title="Active recently"
            aria-label="Active recently"
            className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-online ring-2 ring-background"
          />
        )}
      </div>

      <div className="min-w-0 max-w-full overflow-hidden">
        <div className="flex min-w-0 max-w-full items-center gap-1 overflow-hidden">
          <p
            className={cn(
              "min-w-0 max-w-full flex-1 truncate text-[16px] font-bold leading-tight",
              unread > 0 ? "text-foreground" : "text-foreground/80"
            )}
          >
            {name}
          </p>
          {verified && (
            <BadgeCheck
              className="size-4 shrink-0 fill-primary text-background"
              aria-label="Verified"
            />
          )}
          {pinned && (
            <Pin className="size-3 shrink-0 rotate-45 text-gold" aria-label="Pinned" />
          )}
        </div>

        {(profession || city) && (
          <p className="mt-0.5 max-w-full truncate text-[13px] leading-tight text-muted-foreground">
            {profession}
            {profession && city && <span className="mx-1 opacity-50">·</span>}
            {city}
          </p>
        )}

        <p
          className={cn(
            "mt-0.5 block w-full min-w-0 max-w-full truncate text-[14px] leading-snug",
            unread > 0 ? "font-medium text-foreground" : "font-normal text-muted-foreground"
          )}
        >
          <PreviewContent text={preview} />
        </p>
      </div>

      <div className="flex w-14 min-w-0 max-w-full flex-col items-end gap-1 overflow-hidden">
        <span
          className={cn(
            "max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-right text-xs leading-none",
            unread > 0 ? "font-semibold text-foreground" : "text-muted-foreground"
          )}
        >
          {timeLabel}
        </span>
        <div className="flex w-full min-w-0 max-w-full items-center justify-end gap-1 overflow-hidden">
          {unread > 0 ? (
            <span
              aria-label={`${unread} unread`}
               className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
            >
              {unread > 9 ? "9+" : unread}
            </span>
          ) : (
            isMe && (
              <span className="flex items-center pr-1 text-muted-foreground">
                {muted ? (
                  <VolumeX className="size-3.5" aria-label="Muted" />
                ) : (
                  <StatusIcon status={conversation.last_message_status || "sent"} />
                )}
              </span>
            )
          )}
          <span data-row-menu onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`More options for ${name}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <MoreVertical className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={onSelect} className="cursor-pointer">
                  <MessageSquare className="mr-2 size-4" />
                  Open conversation
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => handleViewProfile()}
                  disabled={!username}
                  className="cursor-pointer"
                >
                  <ExternalLink className="mr-2 size-4" />
                  View profile
                </DropdownMenuItem>
                {unread > 0 && (
                  <DropdownMenuItem onSelect={handleMarkRead} className="cursor-pointer">
                    <CheckCheck className="mr-2 size-4" />
                    Mark as read
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        </div>
      </div>
    </article>
  );
});
