"use client";

/* eslint-disable @next/next/no-img-element */

import { Play, Youtube, Star } from "lucide-react";
import type { PortfolioItem } from "@/lib/types/portfolio";
import { PortfolioTypeBadge } from "./PortfolioTypeBadge";
import { PortfolioStats } from "./PortfolioStats";
import { PortfolioActions } from "./PortfolioActions";

interface FeaturedPortfolioProps {
  item: PortfolioItem;
  isOwner?: boolean;
  onClick?: () => void;
  onEdit?: (item: PortfolioItem) => void;
}

export function FeaturedPortfolio({
  item,
  isOwner,
  onClick,
  onEdit,
}: FeaturedPortfolioProps) {
  const isVideo = item.type === "video" || item.type === "youtube";

  return (
    <section className="mt-6 sm:mt-8">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Featured Work
      </h2>
      <article
        onClick={onClick}
        className={`group mt-4 overflow-hidden rounded-[20px] border border-border bg-card transition-all hover:border-primary/40 hover:shadow-card-hover ${
          onClick ? "cursor-pointer" : ""
        }`}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[21/9]">
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
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
            <PortfolioTypeBadge type={item.type} />
          </div>

          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="grid size-16 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-transform group-hover:scale-110 sm:size-20">
                {item.type === "youtube" ? (
                  <Youtube className="size-7 sm:size-8" />
                ) : (
                  <Play className="size-7 fill-current sm:size-8" />
                )}
              </span>
            </div>
          )}

          {item.duration && (
            <span className="absolute bottom-4 right-4 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white sm:bottom-5 sm:right-5">
              {item.duration}
            </span>
          )}

          {isOwner && (
            <div
              className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100 sm:right-5 sm:top-5"
              onClick={(e) => e.stopPropagation()}
            >
              <PortfolioActions item={item} onEdit={onEdit} />
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                <Star className="size-3 fill-current" />
                Featured
              </span>
              <h3 className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">
                {item.title}
              </h3>
              {item.description ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
              {item.skills.length > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.skills.join(" · ")}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <PortfolioStats
              likesCount={item.likesCount}
              viewsCount={item.viewsCount}
              liked={item.isLiked}
            />
          </div>
        </div>
      </article>
    </section>
  );
}
