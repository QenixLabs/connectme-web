"use client";

import { useRouter } from "next/navigation";
import { Plug, FileDown, Bookmark, MessageSquare } from "lucide-react";

interface ActionBarProps {
  username: string;
  onConnect?: () => void;
  onSendMessage?: () => void;
  onBookmark?: () => void;
  connectDisabled?: boolean;
  sendMessageDisabled?: boolean;
  showBookmark?: boolean;
}

export function ActionBar({
  username,
  onConnect,
  onSendMessage,
  onBookmark,
  connectDisabled,
  sendMessageDisabled,
  showBookmark = true,
}: ActionBarProps) {
  const router = useRouter();

  return (
    <section className="px-4 mt-2">
      <div className="rounded-2xl bg-card border border-border/60 shadow-luxe p-2.5 flex items-center gap-2">
        <button
          onClick={onConnect}
          disabled={connectDisabled}
          className="flex-1 h-12 rounded-xl bg-gradient-to-b from-[oklch(0.78_0.13_80)] to-[oklch(0.68_0.13_78)] text-white font-medium text-[13px] flex items-center justify-center gap-2 shadow-[0_8px_24px_-10px_oklch(0.74_0.13_80/0.7)] active:scale-[0.99] transition disabled:opacity-50"
        >
          <Plug className="h-4 w-4" />
          Connect
        </button>
        <button
          onClick={onSendMessage}
          disabled={sendMessageDisabled}
          className="h-12 px-4 rounded-xl bg-cream border border-border text-ink-soft text-[13px] font-medium flex items-center justify-center gap-2 active:scale-[0.99] transition disabled:opacity-50"
        >
          <MessageSquare className="h-4 w-4 text-gold" />
          Message
        </button>
        <button
          onClick={() => router.push(`/talent/${username}/portfolio`)}
          className="h-12 px-4 rounded-xl bg-cream border border-border text-ink-soft text-[13px] font-medium flex items-center justify-center gap-2 active:scale-[0.99] transition"
        >
          <FileDown className="h-4 w-4 text-gold" />
          Media Kit
        </button>
        {showBookmark && (
          <button
            onClick={onBookmark}
            className="h-12 w-12 rounded-xl bg-cream border border-border grid place-items-center active:scale-[0.99] transition"
          >
            <Bookmark className="h-4 w-4 text-gold" />
          </button>
        )}
      </div>
    </section>
  );
}
