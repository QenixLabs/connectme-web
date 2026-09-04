"use client";

import { memo } from "react";
import { motion } from "motion/react";
import { Check, CheckCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ConversationParticipant, Message } from "@/lib/api/types";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showAvatar?: boolean;
  participant?: ConversationParticipant;
  index?: number;
}

function formatMessageTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function StatusIcon({ status }: { status: Message["status"] }) {
  if (status === "sending" || status === "failed") {
    return <Clock className="size-3 opacity-70" />;
  }
  if (status === "read") {
    return <CheckCheck className="size-3 text-cyan" />;
  }
  if (status === "delivered") {
    return <CheckCheck className="size-3 opacity-70" />;
  }
  return <Check className="size-3 opacity-70" />;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isMe,
  showAvatar,
  participant,
  index = 0,
}: MessageBubbleProps) {
  const name = participant?.full_legal_name || participant?.company_name || "Unknown";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex w-full items-end gap-2", isMe ? "justify-end" : "justify-start")}
    >
      {!isMe && showAvatar ? (
        <Avatar className="size-7 ring-1 ring-border">
          <AvatarImage src={participant?.profile_photo} alt={`${name} profile photo`} />
          <AvatarFallback className="bg-muted text-[10px] font-semibold">{initials}</AvatarFallback>
        </Avatar>
      ) : (
        !isMe && <div className="size-7 shrink-0" />
      )}

      <div
        className={cn(
          "relative max-w-[78%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-sm transition-transform duration-150 active:scale-[0.99] lg:max-w-[60%]",
          isMe
            ? "rounded-br-md bg-gradient-to-br from-primary to-[#4C8DF0] text-white shadow-[var(--shadow-message)]"
            : "rounded-bl-md border border-border bg-surface-raised text-foreground"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <span
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[11px]",
            isMe ? "text-white/70" : "text-muted-foreground"
          )}
        >
          {formatMessageTime(message.created_at)}
          {isMe && <StatusIcon status={message.status} />}
        </span>
      </div>
    </motion.div>
  );
});
