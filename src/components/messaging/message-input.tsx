"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Ban, Paperclip, Smile } from "lucide-react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 128) + "px";
  }, []);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = value.trim().length > 0;
  const charCount = value.length;

  if (isBlocked) {
    return (
      <div className="shrink-0 z-10">
        <div className="mx-3 mb-3 px-4 py-3 bg-red-50/90 backdrop-blur-sm border border-red-100 rounded-2xl flex items-center justify-center gap-2 shadow-sm">
          <Ban className="w-4 h-4 text-red-400" strokeWidth={1.5} />
          <span className="text-xs font-medium text-red-600">
            {blockedByMe
              ? "You have blocked this user"
              : "You have been blocked by this user"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 z-10">
      <div className="mx-3 mb-3">
        <div
          className={cn(
            "relative flex items-end gap-2 bg-card border rounded-2xl px-3 py-2 transition-all duration-200",
            isFocused
              ? "border-gold/60 shadow-lg shadow-gold/5 ring-1 ring-gold/10"
              : "border-border shadow-sm",
          )}
        >
          <button
            type="button"
            className="p-1.5 rounded-full text-ink-muted hover:text-ink-soft hover:bg-cream transition-colors flex-shrink-0 mb-0.5"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" strokeWidth={1.5} />
          </button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Write a message..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-ink placeholder:text-ink-muted outline-none py-1.5 max-h-32"
          />

          <button
            type="button"
            className="p-1.5 rounded-full text-ink-muted hover:text-ink-soft hover:bg-cream transition-colors flex-shrink-0 mb-0.5"
            title="Add emoji"
          >
            <Smile className="w-4 h-4" strokeWidth={1.5} />
          </button>

          <button
            onClick={onSend}
            disabled={!canSend}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
              canSend
                ? "bg-gold text-white hover:bg-gold-hover hover:shadow-md hover:scale-105 active:scale-95 shadow-sm"
                : "bg-cream text-ink-muted cursor-default",
            )}
          >
            <Send
              className={cn(
                "w-4 h-4 transition-transform",
                canSend && "-rotate-45 translate-x-px -translate-y-px",
              )}
              strokeWidth={2}
            />
          </button>
        </div>

        <div className="flex items-center justify-between px-1 mt-1.5">
          <span className="text-[10px] text-ink-muted select-none">
            Shift + Enter for new line
          </span>
          {charCount > 300 && (
            <span
              className={cn(
                "text-[10px] tabular-nums select-none",
                charCount > 800
                  ? "text-red-500 font-medium"
                  : charCount > 500
                    ? "text-amber-500"
                    : "text-ink-muted",
              )}
            >
              {charCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
