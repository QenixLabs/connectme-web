"use client";

import { useState, useMemo } from "react";
import { Play, Eye, Pin } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

function formatCount(n?: number): string {
  if (!n) return "";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "work", label: "Work" },
  { key: "personal", label: "Personal" },
  { key: "intro", label: "Intro" },
] as const;

const CATEGORY_BADGE: Record<string, string> = {
  work: "bg-blue-50 text-blue-700 border-blue-200",
  personal: "bg-amber-50 text-amber-700 border-amber-200",
  intro: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

interface PortfolioShowcaseProps {
  items: PortfolioItem[];
  onItemClick: (item: PortfolioItem, index: number) => void;
}

export function PortfolioShowcase({ items, onItemClick }: PortfolioShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((i) => i.category === activeCategory);
  }, [items, activeCategory]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: items.length };
    for (const c of CATEGORIES) {
      if (c.key !== "all") map[c.key] = items.filter((i) => i.category === c.key).length;
    }
    return map;
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="px-4 mt-8">
        <EmptyState
          icon="ImageIcon"
          title="No portfolio items"
          description="This talent hasn't added any portfolio items yet."
        />
      </div>
    );
  }

  return (
    <section className="px-4 mt-5">
      <h3 className="text-[14px] font-semibold text-ink mb-3">Portfolio</h3>

      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto no-scrollbar">
        {CATEGORIES.map(({ key, label }) => {
          const count = counts[key];
          if (count === 0 && key !== "all") return null;

          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors",
                activeCategory === key
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-ink-soft border-border hover:bg-cream/50",
              )}
            >
              {label}
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full",
                  activeCategory === key
                    ? "bg-white/20"
                    : "bg-muted",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((item, idx) => {
          const isVideo = item.type === "video";
          const isImage = item.type === "image";
          const isYoutube = item.type === "youtube";
          const isInstagram = item.type === "instagram";
          const globalIdx = items.indexOf(item);

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              onClick={() => onItemClick(item, globalIdx)}
              className="text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 rounded-xl"
            >
              <Card
                className={cn(
                  "overflow-hidden border-border/60 hover:shadow-lg transition-shadow duration-300",
                  item.is_pinned && "ring-2 ring-gold/40",
                )}
              >
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  {(isImage || isVideo) && item.url && (
                    <>
                      {isImage ? (
                        <img
                          src={item.url}
                          alt={item.title || item.caption || "Portfolio"}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="absolute inset-0 w-full h-full object-cover"
                          preload="metadata"
                          muted
                          playsInline
                          loop
                          onMouseEnter={(e) => {
                            const v = e.currentTarget;
                            v.play().catch(() => {});
                          }}
                          onMouseLeave={(e) => {
                            const v = e.currentTarget;
                            v.pause();
                          }}
                        />
                      )}
                    </>
                  )}

                  {isYoutube && (
                    <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.title || "YouTube"}
                          className="absolute inset-0 w-full h-full object-cover opacity-60"
                          loading="lazy"
                        />
                      ) : null}
                      <div className="relative z-10 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" strokeWidth={2} />
                      </div>
                    </div>
                  )}

                  {isInstagram && (
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-yellow-500/30 flex items-center justify-center">
                      <span className="text-2xl">📸</span>
                    </div>
                  )}

                  {isVideo && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium">
                      <Play className="w-2.5 h-2.5" strokeWidth={2} />
                      <span>Video</span>
                    </div>
                  )}

                  {item.is_pinned && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gold/90 text-white text-[10px] font-medium shadow">
                      <Pin className="w-2.5 h-2.5" strokeWidth={2} />
                      <span>Featured</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg translate-y-1 group-hover:translate-y-0">
                      <Eye className="w-4 h-4 text-ink" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>

                <CardContent className="p-3 space-y-1">
                  {item.title && (
                    <p className="text-[13px] font-semibold text-ink leading-snug line-clamp-2">
                      {item.title}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-[12px] text-ink-muted leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  )}
                  {!item.title && !item.description && item.caption && (
                    <p className="text-[13px] font-medium text-ink leading-snug line-clamp-2">
                      {item.caption}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <span
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded-full border capitalize",
                        CATEGORY_BADGE[item.category] || "bg-muted text-ink-muted border-border",
                      )}
                    >
                      {item.category}
                    </span>
                    {(item.view_count ?? 0) > 0 && (
                      <span className="text-[10px] text-ink-muted inline-flex items-center gap-1">
                        <Eye className="w-2.5 h-2.5" strokeWidth={1.5} />
                        {formatCount(item.view_count)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
