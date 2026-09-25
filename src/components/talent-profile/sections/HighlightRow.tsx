"use client";

/* eslint-disable @next/next/no-img-element */

import { useRef } from "react";
import Link from "next/link";
import { Play, type LucideIcon } from "lucide-react";
import { GlassCard } from "../primitives";
import type { PortfolioItem } from "@/lib/types/portfolio";
import { ScrollDots } from "./ScrollDots";
import { cn } from "@/lib/utils";

export function HighlightRow({
  icon: Icon,
  title,
  variant,
  items,
  username,
  onOpenReel,
}: {
  icon: LucideIcon;
  title: string;
  variant: "video" | "image";
  items: PortfolioItem[];
  username: string;
  onOpenReel?: (itemId: string) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  return (
    <GlassCard className="p-3 sm:p-3.5">
      <div className="mb-2.5 flex items-center gap-2">
        <span
          className={cn(
            "grid size-7 place-items-center rounded-lg",
            variant === "video"
              ? "bg-pink-50 text-[#EC4899]"
              : "bg-teal-50 text-[#14B8A6]",
          )}
        >
          <Icon className="size-4" />
        </span>
        <h2 className="text-[15px] font-bold text-foreground">{title}</h2>
        <Link
          href={`/talent/${encodeURIComponent(username)}/portfolio`}
          className="ml-auto shrink-0 text-xs font-semibold text-brand transition-colors hover:text-brand/80"
        >
          View All
        </Link>
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
              className="group w-[154px] shrink-0 snap-start text-left sm:w-[176px]"
            >
              <span className="relative block aspect-[1.65/1] overflow-hidden rounded-[15px] bg-slate-100 shadow-[0_5px_14px_rgba(15,23,42,0.1)]">
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 grid place-items-center bg-slate-950/10 transition-colors group-hover:bg-slate-950/25">
                  <span className="grid size-7 place-items-center rounded-full bg-foreground/30 backdrop-blur-sm">
                    <Play className="size-3.5 fill-card text-card" />
                  </span>
                </span>
                {item.duration && (
                  <span className="absolute bottom-2 right-2 rounded-md bg-slate-950/70 px-1.5 py-0.5 text-[10px] font-semibold text-card backdrop-blur-sm">
                    {item.duration}
                  </span>
                )}
                <span className="absolute left-2 top-2 rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-md">
                  Video
                </span>
              </span>
              <span className="mt-1.5 block line-clamp-2 text-[12px] font-medium leading-tight text-foreground">
                {item.title}
              </span>
            </button>
          ) : (
            <button
              key={item.id}
              onClick={() => onOpenReel?.(item.id)}
              className="group w-[132px] shrink-0 snap-start text-left sm:w-[154px]"
            >
              <span className="relative block aspect-[1.25/1] overflow-hidden rounded-[15px] bg-slate-100 shadow-[0_5px_14px_rgba(15,23,42,0.1)]">
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                <span className="absolute left-2 top-2 rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-md">
                  Image
                </span>
              </span>
              <span className="mt-1.5 block truncate text-[12px] font-semibold text-foreground">
                {item.title}
              </span>
             </button>
          ),
        )}
      </div>
      <ScrollDots scrollRef={rowRef} count={items.length} />
    </GlassCard>
  );
}
