"use client";

import type { PortfolioItem } from "@/lib/types/portfolio";
import { PortfolioCard } from "./PortfolioCard";

interface PortfolioGridProps {
  items: PortfolioItem[];
  isOwner?: boolean;
  onItemClick: (item: PortfolioItem, index: number) => void;
  onEdit?: (item: PortfolioItem) => void;
}

export function PortfolioGrid({
  items,
  isOwner,
  onItemClick,
  onEdit,
}: PortfolioGridProps) {
  if (items.length === 0) return null;

  return (
    <section className="mt-6 sm:mt-8">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/50">
        All Work
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:gap-5">
        {items.map((item, index) => (
          <PortfolioCard
            key={item.id}
            item={item}
            isOwner={isOwner}
            onClick={() => onItemClick(item, index)}
            onEdit={onEdit}
          />
        ))}
      </div>
    </section>
  );
}
