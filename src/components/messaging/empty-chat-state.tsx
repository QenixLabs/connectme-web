"use client";

import { MessageCircle } from "lucide-react";

export function EmptyChatState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-msg-gold-soft border border-msg-gold/20 flex items-center justify-center mb-5">
        <MessageCircle className="w-7 h-7 text-msg-gold" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-msg-ink">No messages yet</p>
      <p className="text-xs text-msg-ink-muted mt-1.5 text-center max-w-[200px] leading-relaxed">
        Send a message to start the conversation
      </p>
    </div>
  );
}
