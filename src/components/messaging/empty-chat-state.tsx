"use client";

import { MessageCircle } from "lucide-react";

export function EmptyChatState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-14 h-14 rounded-full bg-msg-gold-soft flex items-center justify-center mb-4">
        <MessageCircle className="w-7 h-7 text-msg-gold" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-msg-ink">No messages yet</p>
      <p className="text-xs text-msg-ink-muted mt-1">
        Send a message to start the conversation
      </p>
    </div>
  );
}
