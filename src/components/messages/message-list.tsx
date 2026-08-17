"use client";

import { useEffect, useRef } from "react";
import { isSameDay, format } from "date-fns";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { MessageBubble } from "./message-bubble";
import { EmptyState } from "./empty-state";
import { Inbox } from "lucide-react";
import type { ConversationParticipant, Message } from "@/lib/api/types";

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  participant?: ConversationParticipant;
  loading?: boolean;
  className?: string;
}

function groupMessagesByDay(messages: Message[]) {
  const groups: { date: Date; messages: Message[] }[] = [];
  messages.forEach((m) => {
    const date = new Date(m.created_at);
    const last = groups[groups.length - 1];
    if (last && isSameDay(last.date, date)) {
      last.messages.push(m);
    } else {
      groups.push({ date, messages: [m] });
    }
  });
  return groups;
}

function formatDateLabel(date: Date) {
  const today = new Date();
  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1))) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

export function MessageList({
  messages,
  currentUserId,
  participant,
  loading,
  className,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const groups = groupMessagesByDay(messages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className={cn("flex-1 space-y-4 overflow-y-auto p-4 lg:p-6", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
            <div
              className={cn(
                "h-10 w-48 animate-pulse rounded-2xl",
                i % 2 === 0 ? "bg-muted" : "bg-primary/20"
              )}
            />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={cn("flex flex-1 items-center justify-center overflow-y-auto", className)}>
        <EmptyState
          icon={Inbox}
          title="No messages yet"
          description="Start the conversation and make a connection."
        />
      </div>
    );
  }

  return (
    <div className={cn("flex-1 overflow-y-auto p-4 lg:p-6", className)}>
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.date.toISOString()} className="space-y-4">
            <div className="flex items-center gap-3">
              <Separator className="flex-1 bg-border/60" />
              <span className="text-xs font-medium text-muted-foreground">
                {formatDateLabel(group.date)}
              </span>
              <Separator className="flex-1 bg-border/60" />
            </div>

            {group.messages.map((m, idx) => {
              const isMe = m.sender_id === currentUserId;
              const prev = group.messages[idx - 1];
              const showAvatar = !isMe && (!prev || prev.sender_id !== m.sender_id);
              return (
                <MessageBubble
                  key={m._id}
                  message={m}
                  isMe={isMe}
                  showAvatar={showAvatar}
                  participant={participant}
                  index={idx}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div ref={bottomRef} className="h-px" />
    </div>
  );
}
