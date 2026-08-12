"use client";

/* eslint-disable @next/next/no-img-element */

import { Play, Youtube, Star } from "lucide-react";
import type { PortfolioItem } from "@/lib/types/portfolio";
import { PortfolioTypeBadge } from "./PortfolioTypeBadge";
import { LikeButton } from "./LikeButton";
import { PortfolioActions } from "./PortfolioActions";

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
      className={`group relative flex flex-col overflow-hidden rounded-[18px] border border-border bg-card transition-all hover:border-primary/40 hover:shadow-card-hover ${
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="absolute left-3 top-3">
          <PortfolioTypeBadge type={item.type} />
        </div>

        {item.isFeatured && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-white">
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
          <LikeButton
            itemId={item.id}
            initialLikes={item.likesCount}
            initialLiked={item.isLiked}
            size="sm"
          />
          {isOwner && (
            <span className="text-xs capitalize text-muted-foreground">
              {item.visibility}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
