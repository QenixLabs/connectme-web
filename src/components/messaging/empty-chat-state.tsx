"use client";

import { MessageCircle } from "lucide-react";

export function EmptyChatState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-6">
      <div className="h-14 w-14 rounded-2xl bg-cream border border-border grid place-items-center mb-4">
        <MessageCircle className="h-6 w-6 text-ink-muted" strokeWidth={1.5} />
      </div>
      <p className="text-[14px] font-semibold text-ink">No messages yet</p>
      <p className="text-[12px] text-ink-muted mt-1.5 text-center max-w-[200px] leading-relaxed">
        Send a message to start the conversation
      </p>
    </div>
  );
}
