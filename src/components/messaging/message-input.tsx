"use client";

import { Send, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isBlocked: boolean;
  blockedByMe: boolean;
}

export function MessageInput({
  value,
  onChange,
  onSend,
  isBlocked,
  blockedByMe,
}: MessageInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  if (isBlocked) {
    return (
      <div className="px-4 py-3 border-t border-msg-border bg-red-50 flex items-center justify-center gap-2 shrink-0 z-10"
      >
        <Ban className="w-4 h-4 text-red-500" strokeWidth={1.5} />
        <span className="text-xs text-red-600 font-medium">
          {blockedByMe
            ? "You have blocked this user"
            : "You have been blocked by this user"}
        </span>
      </div>
    );
  }

  return (
    <div className="px-4 py-2.5 border-t border-msg-border bg-msg-card flex items-center gap-2 shrink-0 z-10"
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-1 text-sm bg-msg-cream border border-msg-border rounded-full px-4 py-2.5 outline-none focus:border-msg-gold focus:bg-white transition-all placeholder:text-msg-ink-muted"
      />
      <button
        onClick={onSend}
        disabled={!value.trim()}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
          value.trim()
            ? "bg-msg-gold text-white hover:bg-msg-gold-dark active:scale-95 shadow-sm"
            : "bg-msg-cream text-msg-ink-muted",
        )}
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
