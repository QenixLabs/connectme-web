"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FolderOpen,
  ArrowRight,
  Grid3X3,
} from "lucide-react";
import { PortfolioStats, type TypeFilter } from "@/components/portfolio/portfolio-stats";
import { PortfolioCategoryFilter } from "@/components/portfolio/portfolio-category-filter";
import { MediaTile } from "@/components/portfolio/media-tile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";

type CategoryFilter = "all" | "work" | "personal" | "intro";

const MAX_VISIBLE = 6;

interface PortfolioSectionProps {
  items: PortfolioItem[];
  onItemClick: (item: PortfolioItem) => void;
  showStats?: boolean;
  showCategoryFilter?: boolean;
  username?: string;
}

export function PortfolioSection({
  items,
  onItemClick,
  showStats = true,
  showCategoryFilter = true,
  username,
}: PortfolioSectionProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(null);

  const stats = useMemo(() => {
    const imagesCount = items.filter((i) => i.type === "image").length;
    const videosCount = items.filter(
      (i) => i.type === "video" || i.type === "youtube" || i.type === "instagram",
    ).length;
    return {
      total_items: items.length,
      items_by_type: { images: imagesCount, videos: videosCount },
      items_by_category: {
        work: items.filter((i) => i.category === "work").length,
        personal: items.filter((i) => i.category === "personal").length,
        intro: items.filter((i) => i.category === "intro").length,
      },
      total_views: 0,
      profile_views_7d: 0,
      profile_views_30d: 0,
    };
  }, [items]);

  const categoryCounts = useMemo(
    () => ({
      work: items.filter((i) => i.category === "work").length,
      personal: items.filter((i) => i.category === "personal").length,
      intro: items.filter((i) => i.category === "intro").length,
    }),
    [items],
  );

  const filteredItems = useMemo(() => {
    let result = categoryFilter === "all"
      ? items
      : items.filter((i) => i.category === categoryFilter);
    if (typeFilter === "image") {
      result = result.filter((i) => i.type === "image");
    } else if (typeFilter === "video") {
      result = result.filter(
        (i) => i.type === "video" || i.type === "youtube" || i.type === "instagram",
      );
    }
    return result;
  }, [items, categoryFilter, typeFilter]);

  const visibleItems = filteredItems.slice(0, MAX_VISIBLE);
  const hasMore = filteredItems.length > MAX_VISIBLE;
  const displayItems = showCategoryFilter ? visibleItems : items;

  if (items.length === 0) return null;

  const portfolioHref = username
    ? `/talent/${username}/portfolio`
    : undefined;

  return (
    <section className="px-4 pt-5 space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gold/10">
            <Grid3X3 className="w-4 h-4 text-gold" strokeWidth={1.5} />
          </div>
          <h2 className="text-base font-semibold text-ink tracking-tight">
            Portfolio
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-ink-muted bg-muted px-2.5 py-1 rounded-full tabular-nums">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
          {portfolioHref && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 rounded-full px-3 text-xs font-medium text-gold hover:bg-gold/10 hover:text-gold"
              asChild
            >
              <Link href={portfolioHref}>
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {showStats && (
        <PortfolioStats
          totalItems={stats.total_items}
          imagesCount={stats.items_by_type.images}
          videosCount={stats.items_by_type.videos}
          totalViews={stats.total_views}
          profileViews7d={stats.profile_views_7d}
          activeType={typeFilter}
          onTypeChange={setTypeFilter}
        />
      )}

      {showCategoryFilter && (
        <PortfolioCategoryFilter
          active={categoryFilter}
          onChange={setCategoryFilter}
          counts={categoryCounts}
        />
      )}

      {displayItems.length === 0 ? (
        <p className="text-center text-xs text-ink-muted py-8">
          No items in this category
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {displayItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onItemClick(item)}
              className={cn(
                "text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-2xl transition active:scale-[0.98]",
              )}
            >
              <MediaTile item={item} />
            </button>
          ))}
        </div>
      )}

      {hasMore && (
        <p className="text-center text-[11px] text-ink-muted">
          +{filteredItems.length - MAX_VISIBLE} more items
          {portfolioHref && (
            <>
              {" "}&mdash;{" "}
              <Link
                href={portfolioHref}
                className="font-medium text-gold hover:underline underline-offset-2"
              >
                view full portfolio
              </Link>
            </>
          )}
        </p>
      )}

      {showCategoryFilter && displayItems.length > 0 && portfolioHref && (
        <div className="pt-1">
          <Button
            variant="outline"
            className="w-full gap-2 rounded-xl border-border/60 text-sm font-medium"
            asChild
          >
            <Link href={portfolioHref}>
              <FolderOpen className="h-4 w-4 text-gold" />
              View Full Portfolio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
