"use client";

import { useEffect, useRef } from "react";
import type { Ref } from "react";
import { AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MessageContextItem } from "@/lib/api";
import { cn } from "@/lib/utils";

interface MessageContextViewerProps {
  reportedMessage: MessageContextItem | null;
  previousMessages: MessageContextItem[];
  nextMessages: MessageContextItem[];
  reportedUserId: string;
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return initials || "?";
}

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function MessageContextViewer({
  reportedMessage,
  previousMessages,
  nextMessages,
  reportedUserId,
}: MessageContextViewerProps) {
  const reportedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reportedRef.current) {
      reportedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [reportedMessage?.id]);

  const allMessages: Array<
    MessageContextItem & { type: "prev" | "reported" | "next" }
  > = [
    ...previousMessages.map((message) => ({ ...message, type: "prev" as const })),
    ...(reportedMessage
      ? [{ ...reportedMessage, type: "reported" as const }]
      : []),
    ...nextMessages.map((message) => ({ ...message, type: "next" as const })),
  ];

  if (allMessages.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
        No conversation linked to this report
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[500px] pr-1">
      <div className="space-y-3">
        {!reportedMessage && previousMessages.length > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-gold/10 p-2 text-xs text-gold">
            <AlertCircle className="h-3.5 w-3.5" />
            Reported message not stored. Showing last {previousMessages.length} messages.
          </div>
        )}

        {allMessages.map((message) => (
          <MessageRow
            key={message.id}
            msg={message}
            isReported={message.type === "reported"}
            isReportedUser={message.sender_id === reportedUserId}
            ref={message.type === "reported" ? reportedRef : undefined}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

function MessageRow({
  msg,
  isReported,
  isReportedUser,
  ref,
}: {
  msg: MessageContextItem;
  isReported: boolean;
  isReportedUser: boolean;
  ref?: Ref<HTMLDivElement>;
}) {
  const avatarTone = isReportedUser
    ? "bg-gold/10 text-gold"
    : "bg-muted text-muted-foreground";

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-start gap-3 rounded-lg p-2 transition-colors",
        isReported
          ? "border border-gold/20 bg-gold/10"
          : "hover:bg-muted/30"
      )}
    >
      <Avatar className="size-7 shrink-0">
        {msg.sender_photo && (
          <AvatarImage src={msg.sender_photo} alt={`${msg.sender_name} profile photo`} />
        )}
        <AvatarFallback className={cn(avatarTone, "text-[10px] font-semibold")}>
          {getInitials(msg.sender_name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-center gap-2">
          <span className="truncate text-xs font-semibold">{msg.sender_name}</span>
          <Badge variant="outline" className="px-1 py-0 text-[10px] capitalize">
            {msg.sender_role}
          </Badge>
          {isReported && (
            <Badge className="border border-gold/20 bg-gold/10 px-1.5 py-0 text-[10px] text-gold">
              Reported
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground">
            {formatMessageTime(msg.created_at)}
          </span>
        </div>
        <div
          className={cn(
            "inline-block rounded-lg border px-3 py-2 text-sm",
            isReportedUser && !isReported
              ? "border-gold/20 bg-gold/10"
              : "border-border bg-muted"
          )}
        >
          {msg.content}
        </div>
      </div>
    </div>
  );
}
