"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Clapperboard, Play, Image as ImageIcon, ChevronRight } from "lucide-react";
import { GlassCard, SectionHeader } from "../primitives";
import { cn } from "@/lib/utils";
import type { PortfolioApiResponse } from "@/lib/api/talent";
import type { PortfolioItem } from "@/lib/types/portfolio";
import { toPortfolioItems } from "../data";

function PortfolioThumb({
  item,
  featured = false,
  onClick,
}: {
  item: PortfolioItem;
  featured?: boolean;
  onClick: () => void;
}) {
  const isVideo = item.type === "video" || item.type === "youtube";
  const img = item.thumbnailUrl || item.url;

  return (
    <button
      onClick={onClick}
      className={cn(
        "profile-media-frame group relative block w-full overflow-hidden rounded-2xl text-left transition-all duration-200 hover:border-border-hover hover:shadow-card-hover",
        featured ? "aspect-[16/10] md:aspect-[21/9]" : "aspect-[4/3]",
      )}
    >
      <img
        src={img}
        alt={item.title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

      {isVideo && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="grid size-12 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-transform group-hover:scale-110 md:size-14">
            <Play className="size-5 fill-current" />
          </span>
        </span>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
        <span className="inline-flex items-center gap-1 rounded-md bg-black/40 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
          {item.type === "image" ? <ImageIcon className="size-3" /> : <Play className="size-3 fill-current" />}
          {item.type === "image" ? "Photo" : item.type === "youtube" ? "YouTube" : "Video"}
        </span>
        <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-white md:text-base">
          {item.title}
        </h3>
      </div>
    </button>
  );
}

export function PortfolioSection({
  items,
  username,
  onOpenReel,
  showAllAction = true,
}: {
  items: PortfolioApiResponse[];
  username: string;
  onOpenReel: (itemId: string) => void;
  showAllAction?: boolean;
}) {
  const router = useRouter();
  const portfolioItems = useMemo(() => toPortfolioItems(items), [items]);
  const featured = portfolioItems.find((i) => i.isFeatured);
  const rest = portfolioItems.filter((i) => i.id !== featured?.id).slice(0, 4);

  const handleViewAll = () => {
    router.push(`/talent/${username}/portfolio`);
  };

  return (
    <GlassCard>
      <SectionHeader
        icon={<Clapperboard className="size-4" />}
        title="Portfolio"
        action={showAllAction ? "View all" : undefined}
        onAction={showAllAction ? handleViewAll : undefined}
      />

      {portfolioItems.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground/60">
          No portfolio items yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {featured && (
            <div className="col-span-2">
              <PortfolioThumb
                item={featured}
                featured
                onClick={() => onOpenReel(featured.id)}
              />
            </div>
          )}
          {rest.map((item) => (
            <PortfolioThumb
              key={item.id}
              item={item}
              onClick={() => onOpenReel(item.id)}
            />
          ))}
        </div>
      )}

      {showAllAction && portfolioItems.length > 5 && (
        <button
          onClick={handleViewAll}
          className="profile-inset mt-4 flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-bg-surface"
        >
          View all work <ChevronRight className="size-4" />
        </button>
      )}
    </GlassCard>
  );
}
