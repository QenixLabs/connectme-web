"use client";

import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MessageContextItem } from "@/lib/api";

interface MessageContextViewerProps {
  reportedMessage: MessageContextItem | null;
  previousMessages: MessageContextItem[];
  nextMessages: MessageContextItem[];
  reportedUserId: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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
  return (
    date.toLocaleDateString([], { month: "short", day: "numeric" }) +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
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
    ...previousMessages.map((m) => ({ ...m, type: "prev" as const })),
    ...(reportedMessage ? [{ ...reportedMessage, type: "reported" as const }] : []),
    ...nextMessages.map((m) => ({ ...m, type: "next" as const })),
  ];

  if (allMessages.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-lg">
        No conversation linked to this report
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
      {!reportedMessage && previousMessages.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
          <AlertCircle className="w-3.5 h-3.5" />
          Reported message not stored. Showing last {previousMessages.length} messages.
        </div>
      )}

      {allMessages.map((msg) => (
        <MessageRow
          key={msg.id}
          msg={msg}
          isReported={msg.type === "reported"}
          isReportedUser={msg.sender_id === reportedUserId}
          ref={msg.type === "reported" ? reportedRef : undefined}
        />
      ))}
    </div>
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
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
        isReported
          ? "bg-amber-50 border border-amber-200"
          : "hover:bg-muted/30"
      }`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${
          isReportedUser
            ? "bg-amber-100 text-amber-700"
            : "bg-slate-100 text-slate-700"
        }`}
      >
        {getInitials(msg.sender_name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-xs font-semibold truncate">{msg.sender_name}</span>
          <Badge variant="outline" className="text-[10px] px-1 py-0 capitalize">
            {msg.sender_role}
          </Badge>
          {isReported && (
            <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-800 border-amber-200">
              Reported
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground">
            {formatMessageTime(msg.created_at)}
          </span>
        </div>
        <div
          className={`inline-block px-3 py-2 rounded-lg text-sm ${
            isReportedUser && !isReported
              ? "bg-amber-50 border border-amber-100"
              : "bg-white border border-border"
          }`}
        >
          {msg.content}
        </div>
      </div>
    </div>
  );
}
