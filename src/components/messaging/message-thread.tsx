"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import { EmptyChatState } from "./empty-chat-state";
import { formatDate } from "./utils";
import type { Message } from "@/lib/api/messages";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  loading: boolean;
}

export function MessageThread({
  messages,
  currentUserId,
  loading,
}: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [loading, messages.length]);

  if (loading) {
    return (
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        style={{
          backgroundColor: "#faf9f7",
          backgroundImage:
            "radial-gradient(circle, #e2e8f0 0.5px, transparent 0.5px)",
          backgroundSize: "16px 16px",
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-3/4 rounded-xl" />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div
        className="flex-1 overflow-y-auto px-4"
        style={{
          backgroundColor: "#faf9f7",
          backgroundImage:
            "radial-gradient(circle, #e2e8f0 0.5px, transparent 0.5px)",
          backgroundSize: "16px 16px",
        }}
      >
        <EmptyChatState />
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-3"
      style={{
        backgroundColor: "#faf9f7",
        backgroundImage:
          "radial-gradient(circle, #e2e8f0 0.5px, transparent 0.5px)",
        backgroundSize: "16px 16px",
      }}
    >
      {messages.map((msg, index) => {
        const isOwn = String(msg.sender_id._id) === currentUserId;
        const showDate =
          index === 0 ||
          formatDate(messages[index - 1].created_at) !==
            formatDate(msg.created_at);

        return (
          <div key={msg._id}>
            {showDate && (
              <div className="flex justify-center my-4">
                <span className="text-2xs text-msg-ink-muted bg-msg-card/80 backdrop-blur-sm border border-msg-border px-3.5 py-1 rounded-full shadow-sm">
                  {formatDate(msg.created_at)}
                </span>
              </div>
            )}
            <MessageBubble
              message={msg}
              isOwn={isOwn}
              currentUserId={currentUserId}
            />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
