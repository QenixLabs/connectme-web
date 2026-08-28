"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo } from "react";
import { Film, Play, Image as ImageIcon } from "lucide-react";
import { CollapsibleSection } from "../primitives";
import type { PortfolioApiResponse } from "@/lib/api/talent";
import type { PortfolioItem } from "@/lib/types/portfolio";
import { toPortfolioItems } from "../data";

function ReelCard({
  item,
  onClick,
}: {
  item: PortfolioItem;
  onClick: () => void;
}) {
  const img = item.thumbnailUrl || item.url;
  const isVideo = item.type === "video" || item.type === "youtube";

  return (
    <button
      onClick={onClick}
      className="group relative w-36 shrink-0 overflow-hidden rounded-xl sm:w-40"
    >
      <img
        src={img}
        alt={item.title}
        loading="lazy"
        className="h-28 w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {isVideo && (
        <span className="absolute inset-0 grid place-items-center bg-foreground/10 transition-colors group-hover:bg-foreground/20">
          <span className="grid size-8 place-items-center rounded-full bg-foreground/40 backdrop-blur-sm">
            <Play className="size-4 fill-current text-card" />
          </span>
        </span>
      )}
      {!isVideo && (
        <span className="absolute inset-0 grid place-items-center bg-foreground/10 transition-colors group-hover:bg-foreground/20">
          <span className="grid size-8 place-items-center rounded-full bg-foreground/40 backdrop-blur-sm">
            <ImageIcon className="size-4 text-card" />
          </span>
        </span>
      )}
      {item.duration && (
        <span className="absolute bottom-1.5 right-1.5 rounded bg-foreground/70 px-1.5 py-0.5 text-[10px] font-semibold text-card">
          {item.duration}
        </span>
      )}
      <span className="absolute bottom-1.5 left-1.5 max-w-[70%] truncate rounded bg-foreground/70 px-1.5 py-0.5 text-[10px] font-semibold text-card">
        {item.title}
      </span>
    </button>
  );
}

export function ShowReelSection({
  items,
  onOpenReel,
  collapsible = false,
}: {
  items: PortfolioApiResponse[];
  onOpenReel?: (itemId: string) => void;
  collapsible?: boolean;
}) {
  const pinnedItems = useMemo(
    () => toPortfolioItems(items.filter((i) => i.is_pinned)),
    [items],
  );

  const pinnedVideos = useMemo(
    () => pinnedItems.filter((i) => i.type !== "image"),
    [pinnedItems],
  );

  const pinnedImages = useMemo(
    () => pinnedItems.filter((i) => i.type === "image"),
    [pinnedItems],
  );

  if (pinnedItems.length === 0) return null;

  return (
    <CollapsibleSection
      icon={<Film className="size-4" />}
      title="Show Reel"
      collapsible={collapsible}
    >
      <div className="space-y-3">
        {pinnedVideos.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
              Videos
            </p>
            <div className="-mx-1 flex gap-3 overflow-x-auto scroll-smooth px-1 pb-1 snap-x snap-mandatory">
              {pinnedVideos.map((item) => (
                <ReelCard
                  key={item.id}
                  item={item}
                  onClick={() => onOpenReel?.(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {pinnedImages.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
              Images
            </p>
            <div className="-mx-1 flex gap-3 overflow-x-auto scroll-smooth px-1 pb-1 snap-x snap-mandatory">
              {pinnedImages.map((item) => (
                <ReelCard
                  key={item.id}
                  item={item}
                  onClick={() => onOpenReel?.(item.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
