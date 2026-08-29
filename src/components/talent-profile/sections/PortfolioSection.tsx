"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Video, Image as ImageIcon, Play } from "lucide-react";
import { CollapsibleSection } from "../primitives";
import type { PortfolioApiResponse } from "@/lib/api/talent";
import type { PortfolioItem } from "@/lib/types/portfolio";
import { toPortfolioItems } from "../data";

function ThumbCard({
  item,
  onClick,
}: {
  item: PortfolioItem;
  onClick: () => void;
}) {
  const isVideo = item.type === "video" || item.type === "youtube";
  const img = item.thumbnailUrl || item.url;

  return (
    <button
      onClick={onClick}
      className="group relative w-32 shrink-0 snap-start overflow-hidden rounded-xl sm:w-36"
    >
      <img
        src={img}
        alt={item.title}
        loading="lazy"
        className="h-24 w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {isVideo && (
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-7 place-items-center rounded-full bg-foreground/30 backdrop-blur-sm">
            <Play className="size-3.5 fill-current text-card" />
          </span>
        </span>
      )}
      {!isVideo && (
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-7 place-items-center rounded-full bg-foreground/30 backdrop-blur-sm">
            <ImageIcon className="size-3.5 text-card" />
          </span>
        </span>
      )}
      <span className="absolute bottom-1.5 right-1.5 max-w-[70%] truncate rounded bg-foreground/60 px-1.5 py-0.5 text-[9px] font-semibold text-card">
        {item.title}
      </span>
    </button>
  );
}

export function PortfolioSection({
  items,
  username,
  onOpenReel,
  showAllAction = true,
  collapsible = false,
}: {
  items: PortfolioApiResponse[];
  username: string;
  onOpenReel?: (itemId: string) => void;
  showAllAction?: boolean;
  collapsible?: boolean;
}) {
  const router = useRouter();
  const portfolioItems = useMemo(() => toPortfolioItems(items), [items]);

  const limit = showAllAction ? 6 : Infinity;
  const videos = portfolioItems.filter((i) => i.type !== "image").slice(0, limit);
  const images = portfolioItems.filter((i) => i.type === "image").slice(0, limit);

  const handleViewAll = () => {
    router.push(`/talent/${username}/portfolio`);
  };

  return (
    <CollapsibleSection
      icon={<Video className="size-4" />}
      title="Portfolio Highlights"
      action={showAllAction && portfolioItems.length > 0 ? "View All" : undefined}
      onAction={showAllAction ? handleViewAll : undefined}
      collapsible={collapsible && portfolioItems.length > 0}
    >
      {portfolioItems.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No portfolio items yet.
        </p>
      ) : (
        <div className="space-y-3">
          {videos.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Videos
              </p>
              <div className="-mx-1 flex gap-2.5 overflow-x-auto scroll-smooth px-1 pb-1 snap-x snap-mandatory">
                {videos.map((item) => (
                  <ThumbCard
                    key={item.id}
                    item={item}
                    onClick={() => onOpenReel?.(item.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {images.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Images
              </p>
              <div className="-mx-1 flex gap-2.5 overflow-x-auto scroll-smooth px-1 pb-1 snap-x snap-mandatory">
                {images.map((item) => (
                  <ThumbCard
                    key={item.id}
                    item={item}
                    onClick={() => onOpenReel?.(item.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </CollapsibleSection>
  );
}
