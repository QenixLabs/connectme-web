"use client";

import { Play, Clock, Eye } from "lucide-react";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";

function formatCount(n?: number): string {
  if (!n) return "0";
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

interface MediaKitHighlightsProps {
  items: PortfolioItem[];
  onItemClick: (item: PortfolioItem) => void;
}

export function MediaKitHighlights({ items, onItemClick }: MediaKitHighlightsProps) {
  if (items.length === 0) return null;

  return (
    <section className="px-4 mt-5">
      <h3 className="text-[14px] font-semibold text-ink mb-3">
        Portfolio Highlights
      </h3>

      <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
        <div className="flex gap-3 min-w-max pb-1">
          {items.map((item) => {
            const isVideo = item.type === "video";
            const isImage = item.type === "image";

            return (
              <button
                key={item.id}
                onClick={() => onItemClick(item)}
                className="w-[200px] shrink-0 text-left group"
              >
                <div className="relative w-full aspect-[3/4] rounded-xl bg-muted overflow-hidden border border-border/60">
                  {isImage ? (
                    <img
                      src={item.url}
                      alt={item.title || item.caption || "Portfolio"}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-black">
                      {item.url && (
                        <video
                          src={item.url}
                          className="absolute inset-0 w-full h-full object-cover"
                          preload="metadata"
                          muted
                          playsInline
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                          <Play className="w-4 h-4 text-white/80" strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>
                  )}

                  {isVideo && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium">
                      <Clock className="w-2.5 h-2.5" strokeWidth={2} />
                      <span>Video</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>

                <div className="mt-2 px-0.5">
                  {item.title && (
                    <p className="text-[13px] font-semibold text-ink leading-snug line-clamp-2">
                      {item.title}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-[11px] text-ink-muted mt-0.5 line-clamp-1">
                      {item.description}
                    </p>
                  )}
                  {!item.title && !item.description && item.caption && (
                    <p className="text-[13px] font-medium text-ink leading-snug line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                  <p className="text-[10px] text-ink-muted mt-1 capitalize">
                    {item.category}
                    {(item.view_count ?? 0) > 0 && (
                      <span className="ml-2 inline-flex items-center gap-1">
                        <Eye className="w-2.5 h-2.5" strokeWidth={1.5} />
                        {formatCount(item.view_count)}
                      </span>
                    )}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
