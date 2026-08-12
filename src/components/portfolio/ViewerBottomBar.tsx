"use client";

import { Bookmark, ImageIcon, Play, Share2 } from "lucide-react";
import type { PortfolioItem } from "@/lib/types/portfolio";

export function ViewerBottomBar({
  item,
  visible,
}: {
  item: PortfolioItem;
  visible: boolean;
}) {
  const isVideo = item.type === "video";

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: item.title, text: item.description }).catch(() => {});
    }
  };

  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-10 transition-opacity duration-300 safe-bottom ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
      }}
    >
      <div className="flex items-end gap-3 px-4 pb-3 pt-12">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`grid size-6 shrink-0 place-items-center rounded-md text-white ${
                isVideo ? "bg-accent" : "bg-accent/60"
              }`}
            >
              {isVideo ? (
                <Play className="size-3 fill-current" />
              ) : (
                <ImageIcon className="size-3" strokeWidth={2} />
              )}
            </span>
            <h3 className="truncate text-sm font-semibold text-white">{item.title}</h3>
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/70">
            {item.description}
          </p>
        </div>
        <button
          aria-label="Save"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60"
        >
          <Bookmark className="size-4" />
        </button>
        <button
          onClick={handleShare}
          aria-label="Share"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60"
        >
          <Share2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
