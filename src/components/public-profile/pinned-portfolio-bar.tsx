"use client";

import { Pin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MediaTile } from "@/components/portfolio/media-tile";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";

interface PinnedPortfolioBarProps {
  items: PortfolioItem[];
  onItemClick: (item: PortfolioItem) => void;
}

export function PinnedPortfolioBar({ items, onItemClick }: PinnedPortfolioBarProps) {
  const pinned = items.filter((i) => i.is_pinned).slice(0, 3);
  if (pinned.length === 0) return null;

  return (
    <section className="px-4 pt-3">
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted flex items-center gap-1.5">
          <Pin className="h-3 w-3 text-gold" /> Pinned
        </p>
        <span className="text-[10px] text-ink-muted">
          {pinned.length} of 3
        </span>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-2.5 snap-x snap-mandatory pb-1">
        {pinned.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onItemClick(item)}
            className="flex-shrink-0 w-[140px] snap-start focus:outline-none"
          >
            <MediaTile item={item} pinned />
          </button>
        ))}
        </div>
      </ScrollArea>
    </section>
  );
}
