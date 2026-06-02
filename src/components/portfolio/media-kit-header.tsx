"use client";

import { ArrowLeft, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface MediaKitHeaderProps {
  onShare?: () => void;
}

export function MediaKitHeader({ onShare }: MediaKitHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/75 border-b border-border/60">
      <div className="flex items-center justify-between px-5 py-3.5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-ink"
        >
          <ArrowLeft className="h-4 w-4 text-gold" />
          <span className="font-serif text-[15px] font-semibold tracking-tight">Media Kit</span>
        </button>
        <button
          onClick={onShare}
          className="h-9 w-9 rounded-full border border-border bg-card grid place-items-center shadow-sm"
        >
          <Share2 className="h-4 w-4 text-gold" />
        </button>
      </div>
    </header>
  );
}
