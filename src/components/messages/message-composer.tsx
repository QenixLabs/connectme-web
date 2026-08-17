"use client";

import { useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  sending?: boolean;
  placeholder?: string;
  className?: string;
}

export function MessageComposer({
  value,
  onChange,
  onSend,
  sending,
  placeholder = "Write a message...",
  className,
}: MessageComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!sending) {
      textareaRef.current?.focus();
    }
  }, [sending]);

  function adjustHeight() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
    adjustHeight();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
      resetHeight();
    }
  }

  function handleSend() {
    onSend();
    resetHeight();
  }

  function resetHeight() {
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  const canSend = value.trim().length > 0 && !sending;

  return (
    <div
      className={cn(
        "flex items-end gap-2 border-t border-border/60 bg-background/95 p-3 backdrop-blur-xl lg:p-4",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-end gap-2 rounded-2xl border border-border bg-surface-raised px-3 py-2 transition-colors focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={sending}
          className="max-h-40 min-h-0 flex-1 resize-none border-0 bg-transparent px-0 py-2 shadow-none focus-visible:ring-0"
        />
      </div>

      <Button
        onClick={handleSend}
        disabled={!canSend}
        aria-label="Send message"
        size="icon"
        className="btn-accept size-11 shrink-0 rounded-full transition-transform duration-150 active:scale-95 disabled:opacity-50"
      >
        {sending ? (
          <span className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <Send className="size-5" />
        )}
      </Button>
    </div>
  );
}
