"use client";

import { useRouter } from "next/navigation";
import {
  getDisplayName,
  getOtherParticipant,
  getOtherParticipantId,
  UserAvatar,
  formatTime,
  formatDate,
} from "./utils";
import type { Conversation } from "@/lib/api/messages";
import { cn } from "@/lib/utils";

interface ConversationCardProps {
  conversation: Conversation;
  currentUserId: string;
  isActive: boolean;
  index: number;
  role: "talent" | "recruiter";
}

export function ConversationCard({
  conversation,
  currentUserId,
  isActive,
  index,
  role,
}: ConversationCardProps) {
  const router = useRouter();
  const other = getOtherParticipant(conversation, currentUserId);
  const otherId =
    other?._id || getOtherParticipantId(conversation, currentUserId);
  const name = getDisplayName(other, otherId);
  const count = conversation.unread_counts[currentUserId] || 0;
  const isUnread = count > 0;

  return (
    <button
      onClick={() => router.push(`/${role}/messages/${conversation._id}`)}
      className={cn(
        "w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 relative group",
        "animate-in fade-in slide-in-from-bottom-2",
        isActive
          ? "bg-cream border-gold/30 shadow-luxe"
          : "bg-card border-border hover:bg-cream/60 hover:border-gold/20 hover:shadow-md",
      )}
      style={{
        animationDelay: `${index * 40}ms`,
        animationFillMode: "both",
      }}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-10 bg-gold rounded-r-full" />
      )}

      <div className="relative shrink-0">
        <UserAvatar
          photo={other?.profile_photo}
          name={name}
          className={cn(
            "w-12 h-12 text-xs font-semibold transition-colors duration-200",
            isUnread
              ? "bg-gold-soft border-2 border-gold text-gold-ink"
              : "bg-cream border-2 border-border text-ink-soft group-hover:border-gold/20",
          )}
        />
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm",
            isUnread ? "bg-emerald-500" : "bg-border",
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-sm truncate",
              isUnread
                ? "font-semibold text-ink"
                : "font-medium text-ink",
            )}
          >
            {name}
          </span>
          {conversation.last_message_at && (
            <span className="text-[10px] text-ink-muted flex-shrink-0 tabular-nums">
              {formatDate(conversation.last_message_at) === "Today"
                ? formatTime(conversation.last_message_at)
                : formatDate(conversation.last_message_at)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p
            className={cn(
              "text-xs truncate flex-1",
              isUnread
                ? "font-medium text-ink-soft"
                : "text-ink-muted",
            )}
          >
            {conversation.last_message_preview || "No messages yet"}
          </p>
          {count > 0 && (
            <div className="min-w-[20px] h-5 rounded-full bg-gold text-white text-[10px] font-semibold flex items-center justify-center px-1.5 flex-shrink-0 shadow-sm shadow-gold/20">
              {count > 99 ? "99+" : count}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
