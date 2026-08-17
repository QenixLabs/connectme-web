"use client";

import { memo } from "react";
import { motion } from "motion/react";
import { BadgeCheck, CheckCheck, Clock, Pin } from "lucide-react";
import { cn, relativeTime } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Conversation } from "@/lib/api/types";

interface ConversationRowProps {
  conversation: Conversation;
  active?: boolean;
  currentUserId: string;
  onSelect: () => void;
  index?: number;
}

export const ConversationRow = memo(function ConversationRow({
  conversation,
  active,
  currentUserId,
  onSelect,
  index = 0,
}: ConversationRowProps) {
  const p = conversation.participant;
  const name = p?.full_legal_name || p?.company_name || "Unknown";
  const initials = name
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

  const preview = isMe
    ? `You: ${conversation.last_message_preview}`
    : conversation.last_message_preview;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-label={`Open conversation with ${name}`}
      aria-current={active ? "true" : undefined}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group cursor-pointer rounded-2xl border p-3.5 transition-all duration-200 outline-none",
        "hover:-translate-y-px hover:shadow-[var(--shadow-card-hover)] focus-visible:ring-2 focus-visible:ring-primary/40",
        active
          ? "border-primary/35 bg-primary/[0.07] shadow-[var(--shadow-glow)]"
          : "border-border bg-surface-raised shadow-[var(--shadow-card)] hover:border-border-hover"
      )}
    >
      <div className="flex items-center gap-3.5">
        <div className="relative shrink-0">
          <Avatar className="size-12 ring-2 ring-border">
            <AvatarImage src={avatar} alt={`${name} profile photo`} />
            <AvatarFallback className="bg-muted text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background shadow-sm">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex min-w-0 items-center gap-1 text-[15px] font-semibold tracking-tight">
              <span className="truncate">{name}</span>
              {verified && (
                <BadgeCheck className="size-4 shrink-0 fill-primary text-background" aria-label="Verified" />
              )}
              {pinned && <Pin className="size-3.5 shrink-0 rotate-45 text-gold" aria-label="Pinned" />}
            </h3>
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {relativeTime(conversation.last_message_at)}
            </span>
          </div>

          <p className="truncate text-xs text-muted-foreground">
            {profession}
            {profession && city && <span className="mx-1 opacity-50">·</span>}
            {city}
          </p>

          <div className="mt-1.5 flex items-end justify-between gap-2">
            <p
              className={cn(
                "min-w-0 flex-1 truncate text-sm",
                unread > 0 ? "font-medium text-foreground" : "text-text-secondary"
              )}
            >
              {preview}
            </p>
            {isMe && unread === 0 && (
              <span className="shrink-0 text-muted-foreground">
                {muted ? (
                  <Clock className="size-3.5" aria-label="Muted" />
                ) : (
                  <CheckCheck className="size-3.5 text-cyan" aria-label="Read" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
});
