"use client";

/* eslint-disable @next/next/no-img-element */

import { Play, Youtube, Star, Heart, Eye } from "lucide-react";
import type { PortfolioItem } from "@/lib/types/portfolio";
import { PortfolioTypeBadge } from "./PortfolioTypeBadge";
import { PortfolioActions } from "./PortfolioActions";
import { formatCount } from "@/hooks/use-portfolio";

interface PortfolioCardProps {
  item: PortfolioItem;
  isOwner?: boolean;
  onClick?: () => void;
  onEdit?: (item: PortfolioItem) => void;
}

export function PortfolioCard({
  item,
  isOwner,
  onClick,
  onEdit,
}: PortfolioCardProps) {
  const isVideo = item.type === "video" || item.type === "youtube";

  return (
    <article
      onClick={onClick}
      className={`portfolio-card group relative flex flex-col overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5 hover:border-border-hover hover:shadow-card-hover ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {item.type === "video" && !item.thumbnailUrl ? (
          <video
            src={item.url}
            className="absolute inset-0 h-full w-full object-contain bg-muted"
            preload="metadata"
            muted
            playsInline
          />
        ) : (
          <img
            src={item.thumbnailUrl || item.url}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="absolute left-3 top-3">
          <PortfolioTypeBadge type={item.type} />
        </div>

        {item.isFeatured && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-gold/90 px-2 py-1 text-[11px] font-medium text-black">
              <Star className="size-3 fill-current" />
              Featured
            </span>
          </div>
        )}

        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="grid size-12 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
              {item.type === "youtube" ? (
                <Youtube className="size-5" />
              ) : (
                <Play className="size-5 fill-current" />
              )}
            </span>
          </div>
        )}

        {item.duration && (
          <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {item.duration}
          </span>
        )}

        {isOwner && (
          <div
            className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <PortfolioActions item={item} onEdit={onEdit} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug text-foreground">
          {item.title}
        </h3>
        {item.description ? (
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        ) : null}

        {item.skills.length > 0 && (
          <p className="mt-2 line-clamp-1 text-[12px] text-muted-foreground">
            {item.skills.join(" · ")}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <span
            className={`inline-flex items-center gap-1.5 text-xs ${
              item.isLiked ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            <Heart className={`size-3.5 ${item.isLiked ? "fill-current" : ""}`} />
            {formatCount(item.likesCount)}
          </span>
          {item.viewsCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Eye className="size-3.5" />
              {formatCount(item.viewsCount)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
