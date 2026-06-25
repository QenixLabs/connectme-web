"use client";

import { useEffect, useRef, useMemo } from "react";
import { MessageBubble, type ClusterPosition } from "./message-bubble";
import { EmptyChatState } from "./empty-chat-state";
import { formatDate } from "./utils";
import type { Message } from "@/lib/api/messages";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  loading: boolean;
}

type ThreadMessage = Message & {
  clusterPosition: ClusterPosition;
  showAvatar: boolean;
  isOwn: boolean;
};

function buildThreadMessages(
  messages: Message[],
  currentUserId: string,
): ThreadMessage[] {
  const result: ThreadMessage[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const isOwn = String(msg.sender_id._id) === currentUserId;
    const prevIsOwn =
      i > 0
        ? String(messages[i - 1].sender_id._id) === currentUserId
        : null;
    const nextIsOwn =
      i < messages.length - 1
        ? String(messages[i + 1].sender_id._id) === currentUserId
        : null;

    let clusterPosition: ClusterPosition;
    if (prevIsOwn !== isOwn && nextIsOwn !== isOwn) clusterPosition = "single";
    else if (prevIsOwn !== isOwn && nextIsOwn === isOwn)
      clusterPosition = "first";
    else if (prevIsOwn === isOwn && nextIsOwn === isOwn)
      clusterPosition = "middle";
    else clusterPosition = "last";

    const showAvatar = !isOwn && (clusterPosition === "single" || clusterPosition === "last");

    result.push({ ...msg, clusterPosition, showAvatar, isOwn });
  }

  return result;
}

export function MessageThread({
  messages,
  currentUserId,
  loading,
}: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);

  const threadMessages = useMemo(
    () => buildThreadMessages(messages, currentUserId),
    [messages, currentUserId],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const isNewMessage = messages.length > prevMessageCountRef.current;
    const lastMsg = messages[messages.length - 1];
    const isOwnLast =
      lastMsg && String(lastMsg.sender_id._id) === currentUserId;

    if (isNewMessage && isOwnLast) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (!isNewMessage) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, currentUserId]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [loading]);

  if (loading) {
    return (
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{ backgroundColor: "var(--color-msg-page)" }}
      >
        <div className="flex justify-center">
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2",
              i % 2 === 0 ? "flex-row" : "flex-row-reverse",
            )}
          >
            {i % 2 === 0 && (
              <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
            )}
            <Skeleton
              className={cn(
                "h-10 rounded-2xl",
                i % 3 === 0
                  ? "w-3/5"
                  : i % 3 === 1
                    ? "w-2/5"
                    : "w-4/5",
                i % 2 !== 0 && "rounded-br-md",
                i % 2 === 0 && "rounded-bl-md",
              )}
            />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4" style={{ backgroundColor: "var(--color-msg-page)" }}>
        <EmptyChatState />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto"
      style={{
        backgroundColor: "var(--color-msg-page)",
        backgroundImage:
          "radial-gradient(circle at 50% 50%, var(--color-msg-border) 0.5px, transparent 0.5px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="px-4 py-4">
        {threadMessages.map((msg, index) => {
          const showDate =
            index === 0 ||
            formatDate(messages[index - 1].created_at) !==
              formatDate(msg.created_at);

          return (
            <div key={msg._id}>
              {showDate && (
                <div className="flex justify-center my-5 first:mt-0">
                  <span className="text-[10px] font-medium text-msg-ink-muted bg-msg-page/80 backdrop-blur-sm border border-msg-border/60 px-3 py-1 rounded-full shadow-sm select-none">
                    {formatDate(msg.created_at)}
                  </span>
                </div>
              )}
              <MessageBubble
                message={msg}
                isOwn={msg.isOwn}
                currentUserId={currentUserId}
                clusterPosition={msg.clusterPosition}
                showAvatar={msg.showAvatar}
              />
            </div>
          );
        })}
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
}
