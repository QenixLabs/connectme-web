"use client";

import { useState, useMemo } from "react";
import { FolderOpen } from "lucide-react";
import { PortfolioStats } from "@/components/portfolio/portfolio-stats";
import { PortfolioCategoryFilter } from "@/components/portfolio/portfolio-category-filter";
import { MediaTile } from "@/components/portfolio/media-tile";
import { cn } from "@/lib/utils";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";

type CategoryFilter = "all" | "work" | "personal" | "intro";

interface PortfolioSectionProps {
  items: PortfolioItem[];
  onItemClick: (item: PortfolioItem) => void;
  showStats?: boolean;
  showCategoryFilter?: boolean;
}

export function PortfolioSection({
  items,
  onItemClick,
  showStats = true,
  showCategoryFilter = true,
}: PortfolioSectionProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const stats = useMemo(() => {
    const imagesCount = items.filter((i) => i.type === "image").length;
    const videosCount = items.filter((i) => i.type === "video" || i.type === "youtube" || i.type === "instagram").length;
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

  const filteredItems = useMemo(
    () =>
      categoryFilter === "all"
        ? items
        : items.filter((i) => i.category === categoryFilter),
    [items, categoryFilter],
  );

  if (items.length === 0) return null;

  return (
    <section className="px-4 pt-5 space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gold/10">
            <FolderOpen className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
          </div>
          <h2 className="text-sm font-semibold text-ink tracking-tight">
            Portfolio
          </h2>
        </div>
        <span className="text-[11px] font-medium text-ink-muted bg-muted px-2.5 py-1 rounded-full tabular-nums">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      {showStats && (
        <PortfolioStats
          totalItems={stats.total_items}
          imagesCount={stats.items_by_type.images}
          videosCount={stats.items_by_type.videos}
          totalViews={stats.total_views}
          profileViews7d={stats.profile_views_7d}
        />
      )}

      {showCategoryFilter && (
        <PortfolioCategoryFilter
          active={categoryFilter}
          onChange={setCategoryFilter}
          counts={categoryCounts}
        />
      )}

      {(showCategoryFilter ? filteredItems : items).length === 0 ? (
        <p className="text-center text-xs text-ink-muted py-8">
          No items in this category
        </p>
      ) : (
        <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory">
          {(showCategoryFilter ? filteredItems : items).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onItemClick(item)}
              className={cn(
                "w-[calc(33.333%-8px)] min-w-[130px] flex-shrink-0 snap-start text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-2xl",
              )}
            >
              <MediaTile item={item} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
