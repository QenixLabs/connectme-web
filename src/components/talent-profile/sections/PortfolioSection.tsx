"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Clapperboard, Play, Image as ImageIcon } from "lucide-react";
import { GlassCard, SectionHeader } from "../primitives";
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
  const typeLabel =
    item.type === "image"
      ? "Photo"
      : item.type === "youtube"
        ? "YouTube"
        : item.type === "instagram"
          ? "Instagram"
          : "Video";

  return (
    <button
      onClick={onClick}
      className="profile-media-frame group relative block w-[150px] shrink-0 snap-start overflow-hidden rounded-xl text-left transition-all duration-200 hover:border-border-hover hover:shadow-card-hover sm:w-[168px]"
    >
      <span className="relative block aspect-[16/10] w-full overflow-hidden">
        <img
          src={img}
          alt={item.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 transition-opacity group-hover:opacity-90" />

        {isVideo && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="grid size-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
              <Play className="size-4 fill-current" />
            </span>
          </span>
        )}

        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/45 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          {isVideo ? (
            <Play className="size-2.5 fill-current" />
          ) : (
            <ImageIcon className="size-2.5" />
          )}
          {typeLabel}
        </span>

        <span className="absolute bottom-0 left-0 right-0 p-2">
          <span className="line-clamp-1 block text-[11px] font-medium text-white">
            {item.title}
          </span>
        </span>
      </span>
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

  const limit = showAllAction ? 4 : Infinity;
  const videos = portfolioItems.filter((i) => i.type !== "image").slice(0, limit);
  const images = portfolioItems.filter((i) => i.type === "image").slice(0, limit);

  const handleViewAll = () => {
    router.push(`/talent/${username}/portfolio`);
  };

  return (
    <GlassCard>
      <SectionHeader
        icon={<Clapperboard className="size-4" />}
        title="Portfolio Highlights"
        action={showAllAction && portfolioItems.length > 0 ? "View All" : undefined}
        onAction={showAllAction ? handleViewAll : undefined}
      />

      {portfolioItems.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground/60">
          No portfolio items yet.
        </p>
      ) : (
        <div className="space-y-4">
          {videos.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/45">
                Videos
              </p>
              <div className="no-scrollbar snap-x-mandatory -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
                {videos.map((item) => (
                  <ThumbCard
                    key={item.id}
                    item={item}
                    onClick={() => onOpenReel(item.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {images.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/45">
                Images
              </p>
              <div className="no-scrollbar snap-x-mandatory -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
                {images.map((item) => (
                  <ThumbCard
                    key={item.id}
                    item={item}
                    onClick={() => onOpenReel(item.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
