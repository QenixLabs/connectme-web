"use client";

/* eslint-disable @next/next/no-img-element */

import { useRef } from "react";
import { Play, type LucideIcon } from "lucide-react";
import { GlassCard } from "../primitives";
import type { PortfolioItem } from "@/lib/types/portfolio";
import { ScrollDots } from "./ScrollDots";

export function HighlightRow({
  icon: Icon,
  title,
  variant,
  items,
  onOpenReel,
}: {
  icon: LucideIcon;
  title: string;
  variant: "video" | "image";
  items: PortfolioItem[];
  onOpenReel?: (itemId: string) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  return (
    <GlassCard>
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-6 place-items-center rounded-md bg-secondary">
          <Icon className="size-3.5 text-brand" />
        </span>
        <h2 className="text-[15px] font-bold text-foreground">{title}</h2>
      </div>
      <div
        ref={rowRef}
        className="relative flex gap-2.5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-1"
      >
        {items.map((item) =>
          variant === "video" ? (
            <button
              key={item.id}
              onClick={() => onOpenReel?.(item.id)}
              className="group w-[110px] shrink-0 snap-start text-left"
            >
              <span className="relative block h-[74px] overflow-hidden rounded-lg">
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 grid place-items-center bg-foreground/10 transition-colors group-hover:bg-foreground/20">
                  <span className="grid size-7 place-items-center rounded-full bg-foreground/30 backdrop-blur-sm">
                    <Play className="size-3.5 fill-card text-card" />
                  </span>
                </span>
                {item.duration && (
                  <span className="absolute bottom-1 right-1 rounded bg-foreground/65 px-1.5 py-0.5 text-[10px] font-semibold text-card">
                    {item.duration}
                  </span>
                )}
              </span>
              <span className="mt-1.5 block line-clamp-2 text-[12px] font-medium leading-tight text-foreground">
                {item.title}
              </span>
            </button>
          ) : (
            <button
              key={item.id}
              onClick={() => onOpenReel?.(item.id)}
              className="group h-[112px] w-[88px] shrink-0 snap-start overflow-hidden rounded-lg"
            >
              <img
                src={item.thumbnailUrl || item.url}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          ),
        )}
      </div>
      <ScrollDots scrollRef={rowRef} count={items.length} />
    </GlassCard>
  );
}
