"use client";

import { ArrowLeft, Share2, PenLine } from "lucide-react";
import { useRouter } from "next/navigation";

interface MediaKitHeaderProps {
  onShare?: () => void;
  isOwner?: boolean;
}

export function MediaKitHeader({ onShare, isOwner }: MediaKitHeaderProps) {
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
        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={() => router.push("/talent/portfolio")}
              className="inline-flex items-center gap-1.5 rounded-full bg-gold text-white px-3.5 py-1.5 text-[11px] font-medium hover:bg-gold/90 transition-colors"
            >
              <PenLine className="h-3 w-3" />
              Manage
            </button>
          )}
          <button
            onClick={onShare}
            className="h-9 w-9 rounded-full border border-border bg-card grid place-items-center shadow-sm"
          >
            <Share2 className="h-4 w-4 text-gold" />
          </button>
        </div>
      </div>
    </header>
  );
}
