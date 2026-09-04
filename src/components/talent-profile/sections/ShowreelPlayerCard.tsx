"use client";

/* eslint-disable @next/next/no-img-element */

import { Clapperboard, Play } from "lucide-react";
import { GlassCard } from "../primitives";
import type { PortfolioItem } from "@/lib/types/portfolio";

export function ShowreelPlayerCard({
  items,
  onOpenReel,
}: {
  items: PortfolioItem[];
  onOpenReel?: (itemId: string) => void;
}) {
  const hero = items.find((i) => i.isFeatured && i.type !== "image");
  if (!hero) return null;

  const img = hero.thumbnailUrl || hero.url;

  return (
    <GlassCard>
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-6 place-items-center rounded-md bg-secondary">
          <Clapperboard className="size-3.5 text-brand" />
        </span>
        <h2 className="text-[15px] font-bold text-foreground">Showreel</h2>
      </div>
      <button
        onClick={() => onOpenReel?.(hero.id)}
        className="group relative block h-40 w-full overflow-hidden rounded-xl"
      >
        <img
          src={img}
          alt={hero.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-12 place-items-center rounded-full border-2 border-card bg-foreground/30 backdrop-blur-sm transition-colors group-hover:bg-foreground/45">
            <Play className="size-5 fill-card text-card" />
          </span>
        </span>
        <span className="absolute bottom-2 left-3 max-w-[60%] truncate rounded-md bg-foreground/60 px-2 py-0.5 text-[11px] font-semibold text-card">
          {hero.title}
        </span>
        {hero.duration && (
          <span className="absolute bottom-2 right-3 rounded-md bg-foreground/60 px-2 py-0.5 text-[11px] font-semibold text-card">
            {hero.duration}
          </span>
        )}
      </button>
    </GlassCard>
  );
}
